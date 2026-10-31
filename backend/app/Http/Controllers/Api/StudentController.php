<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    // Get students from Supabase PostgreSQL
    public function index()
    {
        $students = Student::orderBy('id')->get([
            'id',
            'student_number',
            'full_name',
            'course',
            'year_level',
            'created_at',
        ]);

        return response()->json([
            'source' => 'supabase',
            'students' => $students,
        ]);
    }

    // Get students from local physical MySQL
    public function physical()
    {
        $students = DB::connection('local_mysql')
            ->table('students')
            ->orderBy('id')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'full_name' => $student->first_name . ' ' . $student->last_name,
                    'course' => $student->course,
                    'year_level' => $student->year_level,
                    'created_at' => $student->created_at,
                ];
            });

        return response()->json([
            'source' => 'physical_mysql',
            'students' => $students,
        ]);
    }
}
