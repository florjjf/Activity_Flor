"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

type Student = {
  id: number;
  student_number: string;
  full_name: string;
  course: string;
  year_level: number | string;
  created_at: string;
};

type User = {
  name: string;
  email: string;
};

type DatabaseSource = "cloud" | "physical";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [source, setSource] = useState<DatabaseSource>("cloud");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Get the logged-in user's information
        const userData = await apiRequest("/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(userData.user);

        // Get student records from the selected database
        const endpoint =
          source === "cloud" ? "/students" : "/physical-students";

        const data = await apiRequest(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStudents(data.students ?? []);
      } catch (err) {
        setStudents([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [source, refreshCount, router]);

  function logout() {
    const token = localStorage.getItem("token");

    async function performLogout() {
      try {
        if (token) {
          await apiRequest("/logout", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } catch {
        // Clear the local session even if the API request fails.
      } finally {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    }

    performLogout();
  }

  function refreshRecords() {
    setRefreshCount((previous) => previous + 1);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900 sm:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Dashboard Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Student Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage student records from cloud and local databases.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Personalized Welcome */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Welcome, {user?.name || "Student"}!
          </h2>

          <p className="mt-2 text-gray-600">
            Email: {user?.email || "Loading..."}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Welcome to your Student Information System dashboard.
          </p>
        </section>

        {/* Database Selection */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">
            Select Database
          </h2>

          <select
            value={source}
            onChange={(e) =>
              setSource(e.target.value as DatabaseSource)
            }
            className="w-full rounded-lg border border-gray-300 bg-white p-3 sm:w-80"
          >
            <option value="cloud">
              Cloud Database (Supabase PostgreSQL)
            </option>

            <option value="physical">
              Physical Database (Local MySQL)
            </option>
          </select>

          <p className="mt-3 text-sm text-gray-600">
            Currently viewing:{" "}
            <strong>
              {source === "cloud"
                ? "Supabase PostgreSQL"
                : "Local MySQL"}
            </strong>
          </p>
        </section>

        {/* Student Record Count */}
        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-600">
            Total Student Records
          </h2>

          <p className="mt-2 text-4xl font-bold text-blue-600">
            {loading ? "..." : students.length}
          </p>
        </section>

        {/* Student Records */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Student Records
            </h2>

            <button
              onClick={refreshRecords}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh Records"}
            </button>
          </div>

          {loading ? (
            <p>Loading student records...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : students.length === 0 ? (
            <p>No student records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3">Student Number</th>
                    <th className="border p-3">Full Name</th>
                    <th className="border p-3">Course</th>
                    <th className="border p-3">Year Level</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="border p-3">
                        {student.student_number}
                      </td>

                      <td className="border p-3">
                        {student.full_name}
                      </td>

                      <td className="border p-3">
                        {student.course}
                      </td>

                      <td className="border p-3">
                        {student.year_level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
