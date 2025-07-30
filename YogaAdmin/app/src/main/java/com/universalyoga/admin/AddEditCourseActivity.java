package com.universalyoga.admin;

import android.os.Bundle;
import android.text.TextUtils;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.universalyoga.admin.data.database.AppDatabase;
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AddEditCourseActivity extends AppCompatActivity {

    private Spinner spinnerDayOfWeek, spinnerTime, spinnerType;
    private EditText etCapacity, etDuration, etPrice, etDescription;
    private Button btnSave, btnClear;

    private YogaCourseDao dao;
    private ExecutorService executor;
    private int courseId = -1; // -1 means new course, otherwise editing existing
    private YogaCourse existingCourse;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_course);

        initViews();
        initDatabase();
        setupSpinners();
        checkForExistingCourse();
        setupClickListeners();
    }

    private void initViews() {
        spinnerDayOfWeek = findViewById(R.id.spinnerDayOfWeek);
        spinnerTime = findViewById(R.id.spinnerTime);
        spinnerType = findViewById(R.id.spinnerType);
        etCapacity = findViewById(R.id.etCapacity);
        etDuration = findViewById(R.id.etDuration);
        etPrice = findViewById(R.id.etPrice);
        etDescription = findViewById(R.id.etDescription);
        btnSave = findViewById(R.id.btnSave);
        btnClear = findViewById(R.id.btnClear);
    }

    private void initDatabase() {
        dao = AppDatabase.getInstance(this).yogaCourseDao();
        executor = Executors.newSingleThreadExecutor();
    }

    private void setupSpinners() {
        // Days of week
        String[] daysOfWeek = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        ArrayAdapter<String> dayAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, daysOfWeek);
        dayAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerDayOfWeek.setAdapter(dayAdapter);

        // Time slots - More comprehensive time options
        String[] timeSlots = {
                "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
                "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
                "18:00", "19:00", "20:00", "21:00"
        };
        ArrayAdapter<String> timeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, timeSlots);
        timeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerTime.setAdapter(timeAdapter);

        // Yoga types
        String[] yogaTypes = {
                "Flow Yoga", "Aerial Yoga", "Family Yoga", "Hatha Yoga",
                "Vinyasa Yoga", "Yin Yoga", "Hot Yoga", "Power Yoga",
                "Restorative Yoga", "Kundalini Yoga"
        };
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, yogaTypes);
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerType.setAdapter(typeAdapter);
    }

    private void checkForExistingCourse() {
        courseId = getIntent().getIntExtra("course_id", -1);
        if (courseId != -1) {
            setTitle("Edit Yoga Course");
            loadCourseData();
        } else {
            setTitle("Add New Yoga Course");
            setDefaultValues();
        }
    }

    private void setDefaultValues() {
        // Set some reasonable defaults
        etCapacity.setText("15");
        etDuration.setText("60");
        etPrice.setText("20.00");
    }

    private void setupClickListeners() {
        btnSave.setOnClickListener(v -> saveCourse());
        btnClear.setOnClickListener(v -> clearFields());
    }

    private void loadCourseData() {
        executor.execute(() -> {
            existingCourse = dao.getCourseById(courseId);
            if (existingCourse != null) {
                runOnUiThread(() -> populateFields(existingCourse));
            } else {
                runOnUiThread(() -> {
                    Toast.makeText(this, "Course not found", Toast.LENGTH_SHORT).show();
                    finish();
                });
            }
        });
    }

    private void populateFields(YogaCourse course) {
        setSpinnerSelection(spinnerDayOfWeek, course.getDayOfWeek());
        setSpinnerSelection(spinnerTime, course.getTime());
        setSpinnerSelection(spinnerType, course.getType());

        etCapacity.setText(String.valueOf(course.getCapacity()));
        etDuration.setText(String.valueOf(course.getDuration()));
        etPrice.setText(String.valueOf(course.getPrice()));
        etDescription.setText(course.getDescription() != null ? course.getDescription() : "");
    }

    private void setSpinnerSelection(Spinner spinner, String value) {
        if (value != null) {
            ArrayAdapter adapter = (ArrayAdapter) spinner.getAdapter();
            int position = adapter.getPosition(value);
            if (position >= 0) {
                spinner.setSelection(position);
            }
        }
    }

    private void saveCourse() {
        if (!validateInputs()) {
            return;
        }

        // Check for duplicate course (same day, time, type)
        if (courseId == -1) { // Only check for duplicates when adding new course
            checkForDuplicateAndSave();
        } else {
            performSave();
        }
    }

    private void checkForDuplicateAndSave() {
        String dayOfWeek = spinnerDayOfWeek.getSelectedItem().toString();
        String time = spinnerTime.getSelectedItem().toString();
        String type = spinnerType.getSelectedItem().toString();

        executor.execute(() -> {
            List<YogaCourse> existingCourses = dao.getCoursesByDay(dayOfWeek);
            boolean isDuplicate = false;

            for (YogaCourse course : existingCourses) {
                if (course.getTime().equals(time) && course.getType().equals(type)) {
                    isDuplicate = true;
                    break;
                }
            }

            if (isDuplicate) {
                runOnUiThread(() ->
                        Toast.makeText(this, "A course with the same day, time, and type already exists!", Toast.LENGTH_LONG).show()
                );
            } else {
                performSave();
            }
        });
    }

    private void performSave() {
        YogaCourse course = createCourseFromInputs();

        executor.execute(() -> {
            try {
                if (courseId == -1) {
                    long newId = dao.insert(course);
                    runOnUiThread(() -> {
                        Toast.makeText(this, "Course added successfully! ID: " + newId, Toast.LENGTH_SHORT).show();
                        finish();
                    });
                } else {
                    course.setId(courseId);
                    dao.update(course);
                    runOnUiThread(() -> {
                        Toast.makeText(this, "Course updated successfully!", Toast.LENGTH_SHORT).show();
                        finish();
                    });
                }
            } catch (Exception e) {
                runOnUiThread(() ->
                        Toast.makeText(this, "Error saving course: " + e.getMessage(), Toast.LENGTH_LONG).show()
                );
            }
        });
    }

    private boolean validateInputs() {
        // Clear previous errors
        etCapacity.setError(null);
        etDuration.setError(null);
        etPrice.setError(null);

        boolean isValid = true;

        // Validate capacity
        String capacityStr = etCapacity.getText().toString().trim();
        if (TextUtils.isEmpty(capacityStr)) {
            etCapacity.setError("Capacity is required");
            isValid = false;
        } else {
            try {
                int capacity = Integer.parseInt(capacityStr);
                if (capacity <= 0 || capacity > 100) {
                    etCapacity.setError("Capacity must be between 1 and 100");
                    isValid = false;
                }
            } catch (NumberFormatException e) {
                etCapacity.setError("Please enter valid number");
                isValid = false;
            }
        }

        // Validate duration
        String durationStr = etDuration.getText().toString().trim();
        if (TextUtils.isEmpty(durationStr)) {
            etDuration.setError("Duration is required");
            isValid = false;
        } else {
            try {
                int duration = Integer.parseInt(durationStr);
                if (duration <= 0 || duration > 300) {
                    etDuration.setError("Duration must be between 1 and 300 minutes");
                    isValid = false;
                }
            } catch (NumberFormatException e) {
                etDuration.setError("Please enter valid number");
                isValid = false;
            }
        }

        // Validate price
        String priceStr = etPrice.getText().toString().trim();
        if (TextUtils.isEmpty(priceStr)) {
            etPrice.setError("Price is required");
            isValid = false;
        } else {
            try {
                double price = Double.parseDouble(priceStr);
                if (price <= 0 || price > 1000) {
                    etPrice.setError("Price must be between £0.01 and £1000");
                    isValid = false;
                }
            } catch (NumberFormatException e) {
                etPrice.setError("Please enter valid price");
                isValid = false;
            }
        }

        return isValid;
    }

    private YogaCourse createCourseFromInputs() {
        String dayOfWeek = spinnerDayOfWeek.getSelectedItem().toString();
        String time = spinnerTime.getSelectedItem().toString();
        String type = spinnerType.getSelectedItem().toString();
        int capacity = Integer.parseInt(etCapacity.getText().toString().trim());
        int duration = Integer.parseInt(etDuration.getText().toString().trim());
        double price = Double.parseDouble(etPrice.getText().toString().trim());
        String description = etDescription.getText().toString().trim();

        return new YogaCourse(dayOfWeek, time, capacity, duration, price, type, description);
    }

    private void clearFields() {
        spinnerDayOfWeek.setSelection(0);
        spinnerTime.setSelection(0);
        spinnerType.setSelection(0);
        etCapacity.setText("");
        etDuration.setText("");
        etPrice.setText("");
        etDescription.setText("");

        // Clear any error messages
        etCapacity.setError(null);
        etDuration.setError(null);
        etPrice.setError(null);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
}