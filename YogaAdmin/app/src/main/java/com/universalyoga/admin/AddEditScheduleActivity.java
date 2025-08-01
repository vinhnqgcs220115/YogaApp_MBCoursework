package com.universalyoga.admin;

import android.app.DatePickerDialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.universalyoga.admin.data.database.AppDatabase;
import com.universalyoga.admin.data.dao.ScheduleDao;
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.entity.Schedule;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AddEditScheduleActivity extends AppCompatActivity {

    private Spinner spinnerCourse;
    private EditText etDate, etTeacher, etComments;
    private Button btnSave, btnClear, btnSelectDate;

    private ScheduleDao scheduleDao;
    private YogaCourseDao courseDao;
    private ExecutorService executor;

    private List<YogaCourse> allCourses = new ArrayList<>();
    private int scheduleId = -1; // -1 means new schedule
    private Schedule existingSchedule;

    private Calendar selectedDate = Calendar.getInstance();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_schedule);

        initViews();
        initDatabase();
        checkForExistingSchedule();
        loadCourses();
        setupClickListeners();
    }

    private void initViews() {
        spinnerCourse = findViewById(R.id.spinnerCourse);
        etDate = findViewById(R.id.etDate);
        etTeacher = findViewById(R.id.etTeacher);
        etComments = findViewById(R.id.etComments);
        btnSave = findViewById(R.id.btnSave);
        btnClear = findViewById(R.id.btnClear);
        btnSelectDate = findViewById(R.id.btnSelectDate);

        // Make date field non-editable (only through date picker)
        etDate.setFocusable(false);
        etDate.setClickable(true);
    }

    private void initDatabase() {
        AppDatabase database = AppDatabase.getInstance(this);
        scheduleDao = database.scheduleDao();
        courseDao = database.yogaCourseDao();
        executor = Executors.newSingleThreadExecutor();
    }

    private void checkForExistingSchedule() {
        scheduleId = getIntent().getIntExtra("schedule_id", -1);
        if (scheduleId != -1) {
            setTitle("Edit Schedule");
            loadScheduleData();
        } else {
            setTitle("Add New Schedule");
            setDefaultDate();
        }
    }

    private void setDefaultDate() {
        // Set today's date as default
        updateDateDisplay();
    }

    private void loadCourses() {
        executor.execute(() -> {
            List<YogaCourse> courses = courseDao.getAllCourses();
            runOnUiThread(() -> {
                allCourses.clear();
                if (courses != null) {
                    allCourses.addAll(courses);
                }
                setupCourseSpinner();
            });
        });
    }

    private void setupCourseSpinner() {
        if (allCourses.isEmpty()) {
            Toast.makeText(this, "No courses available. Please create courses first.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        List<String> courseNames = new ArrayList<>();
        for (YogaCourse course : allCourses) {
            String courseName = course.getType() + " - " +
                    course.getDayOfWeek() + " " +
                    course.getTime() +
                    " (£" + String.format("%.2f", course.getPrice()) + ")";
            courseNames.add(courseName);
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, courseNames);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerCourse.setAdapter(adapter);
    }

    private void setupClickListeners() {
        btnSave.setOnClickListener(v -> saveSchedule());
        btnClear.setOnClickListener(v -> clearFields());
        btnSelectDate.setOnClickListener(v -> showDatePicker());
        etDate.setOnClickListener(v -> showDatePicker());
    }

    private void showDatePicker() {
        DatePickerDialog datePickerDialog = new DatePickerDialog(
                this,
                (view, year, month, dayOfMonth) -> {
                    selectedDate.set(Calendar.YEAR, year);
                    selectedDate.set(Calendar.MONTH, month);
                    selectedDate.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                    updateDateDisplay();
                    validateDateWithCourse();
                },
                selectedDate.get(Calendar.YEAR),
                selectedDate.get(Calendar.MONTH),
                selectedDate.get(Calendar.DAY_OF_MONTH)
        );

        // Don't allow past dates for new schedules
        if (scheduleId == -1) {
            datePickerDialog.getDatePicker().setMinDate(System.currentTimeMillis() - 1000);
        }

        datePickerDialog.show();
    }

    private void updateDateDisplay() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
        etDate.setText(sdf.format(selectedDate.getTime()));
    }

    private void validateDateWithCourse() {
        if (spinnerCourse.getSelectedItemPosition() < 0 ||
                spinnerCourse.getSelectedItemPosition() >= allCourses.size()) {
            return;
        }

        YogaCourse selectedCourse = allCourses.get(spinnerCourse.getSelectedItemPosition());
        String courseDayOfWeek = selectedCourse.getDayOfWeek();

        // Get day of week from selected date
        SimpleDateFormat dayFormat = new SimpleDateFormat("EEEE", Locale.getDefault());
        String selectedDayOfWeek = dayFormat.format(selectedDate.getTime());

        if (!courseDayOfWeek.equalsIgnoreCase(selectedDayOfWeek)) {
            Toast.makeText(this,
                    "Warning: Selected date (" + selectedDayOfWeek + ") doesn't match course day (" + courseDayOfWeek + ")",
                    Toast.LENGTH_LONG).show();
        }
    }

    private void loadScheduleData() {
        executor.execute(() -> {
            existingSchedule = scheduleDao.getScheduleById(scheduleId);
            if (existingSchedule != null) {
                runOnUiThread(() -> populateFields(existingSchedule));
            } else {
                runOnUiThread(() -> {
                    Toast.makeText(this, "Schedule not found", Toast.LENGTH_SHORT).show();
                    finish();
                });
            }
        });
    }

    private void populateFields(Schedule schedule) {
        // Set course selection
        setCourseSelection(schedule.getCourseId());

        // Set date
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            Date date = sdf.parse(schedule.getDate());
            selectedDate.setTime(date);
            updateDateDisplay();
        } catch (ParseException e) {
            etDate.setText(schedule.getDate());
        }

        // Set other fields
        etTeacher.setText(schedule.getTeacher());
        etComments.setText(schedule.getComments() != null ? schedule.getComments() : "");
    }

    private void setCourseSelection(int courseId) {
        for (int i = 0; i < allCourses.size(); i++) {
            if (allCourses.get(i).getId() == courseId) {
                spinnerCourse.setSelection(i);
                break;
            }
        }
    }

    private void saveSchedule() {
        if (!validateInputs()) {
            return;
        }

        Schedule schedule = createScheduleFromInputs();

        executor.execute(() -> {
            try {
                if (scheduleId == -1) {
                    // Check for duplicate schedule
                    List<Schedule> existingSchedules = scheduleDao.getSchedulesForDate(schedule.getDate());
                    boolean isDuplicate = false;

                    for (Schedule existing : existingSchedules) {
                        if (existing.getCourseId() == schedule.getCourseId()) {
                            isDuplicate = true;
                            break;
                        }
                    }

                    if (isDuplicate) {
                        runOnUiThread(() ->
                                Toast.makeText(this, "A schedule for this course and date already exists!", Toast.LENGTH_LONG).show()
                        );
                        return;
                    }

                    // Insert new schedule
                    long newId = scheduleDao.insert(schedule);
                    runOnUiThread(() -> {
                        Toast.makeText(this, "Schedule added successfully! ID: " + newId, Toast.LENGTH_SHORT).show();
                        finish();
                    });
                } else {
                    // Update existing schedule
                    schedule.setId(scheduleId);
                    scheduleDao.update(schedule);
                    runOnUiThread(() -> {
                        Toast.makeText(this, "Schedule updated successfully!", Toast.LENGTH_SHORT).show();
                        finish();
                    });
                }
            } catch (Exception e) {
                runOnUiThread(() ->
                        Toast.makeText(this, "Error saving schedule: " + e.getMessage(), Toast.LENGTH_LONG).show()
                );
            }
        });
    }

    private boolean validateInputs() {
        // Clear previous errors
        etDate.setError(null);
        etTeacher.setError(null);

        boolean isValid = true;

        // Validate course selection
        if (spinnerCourse.getSelectedItemPosition() < 0) {
            Toast.makeText(this, "Please select a course", Toast.LENGTH_SHORT).show();
            isValid = false;
        }

        // Validate date
        String dateStr = etDate.getText().toString().trim();
        if (TextUtils.isEmpty(dateStr)) {
            etDate.setError("Date is required");
            isValid = false;
        } else {
            // Validate date format
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                sdf.setLenient(false);
                sdf.parse(dateStr);
            } catch (ParseException e) {
                etDate.setError("Invalid date format (yyyy-MM-dd)");
                isValid = false;
            }
        }

        // Validate teacher
        String teacherStr = etTeacher.getText().toString().trim();
        if (TextUtils.isEmpty(teacherStr)) {
            etTeacher.setError("Teacher name is required");
            isValid = false;
        } else if (teacherStr.length() < 2) {
            etTeacher.setError("Teacher name must be at least 2 characters");
            isValid = false;
        }

        return isValid;
    }

    private Schedule createScheduleFromInputs() {
        int courseId = allCourses.get(spinnerCourse.getSelectedItemPosition()).getId();
        String date = etDate.getText().toString().trim();
        String teacher = etTeacher.getText().toString().trim();
        String comments = etComments.getText().toString().trim();

        return new Schedule(courseId, date, teacher, comments);
    }

    private void clearFields() {
        if (spinnerCourse.getAdapter() != null && spinnerCourse.getAdapter().getCount() > 0) {
            spinnerCourse.setSelection(0);
        }
        selectedDate = Calendar.getInstance();
        updateDateDisplay();
        etTeacher.setText("");
        etComments.setText("");

        // Clear error messages
        etDate.setError(null);
        etTeacher.setError(null);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
}