package com.universalyoga.admin;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.google.android.material.textfield.TextInputLayout;
import com.universalyoga.admin.data.database.AppDatabase;
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AddEditCourseActivity extends AppCompatActivity {

    private Spinner spinnerDayOfWeek, spinnerTime, spinnerType;
    private EditText etCapacity, etDuration, etPrice, etDescription;
    private TextInputLayout tilCapacity, tilDuration, tilPrice, tilDescription;
    private Button btnSave, btnClear;

    private YogaCourseDao dao;
    private ExecutorService executor;
    private int courseId = -1; // -1 means new course, otherwise editing existing
    private YogaCourse existingCourse;

    // Real-time validation flags
    private boolean isCapacityValid = false;
    private boolean isDurationValid = false;
    private boolean isPriceValid = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_edit_course);

        initViews();
        initDatabase();
        setupSpinners();
        checkForExistingCourse();
        setupRealTimeValidation();
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

        // TextInputLayouts for better validation UX
        tilCapacity = findViewById(R.id.tilCapacity);
        tilDuration = findViewById(R.id.tilDuration);
        tilPrice = findViewById(R.id.tilPrice);
        tilDescription = findViewById(R.id.tilDescription);

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
                "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
                "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
                "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
                "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
        };
        ArrayAdapter<String> timeAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item, timeSlots);
        timeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerTime.setAdapter(timeAdapter);

        // Yoga types - Enhanced list
        String[] yogaTypes = {
                "Flow Yoga", "Aerial Yoga", "Family Yoga", "Hatha Yoga",
                "Vinyasa Yoga", "Yin Yoga", "Hot Yoga", "Power Yoga",
                "Restorative Yoga", "Kundalini Yoga", "Ashtanga Yoga",
                "Bikram Yoga", "Prenatal Yoga", "Senior Yoga", "Kids Yoga"
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

        // Set default validations to true for new courses with defaults
        isCapacityValid = true;
        isDurationValid = true;
        isPriceValid = true;
        updateSaveButtonState();
    }

    private void setupRealTimeValidation() {
        // Capacity validation
        etCapacity.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                validateCapacity(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Duration validation
        etDuration.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                validateDuration(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Price validation
        etPrice.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                validatePrice(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Description validation (optional but with character count)
        etDescription.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                updateDescriptionCounter(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void validateCapacity(String capacityStr) {
        if (TextUtils.isEmpty(capacityStr)) {
            tilCapacity.setError("Capacity is required");
            tilCapacity.setErrorEnabled(true);
            isCapacityValid = false;
        } else {
            try {
                int capacity = Integer.parseInt(capacityStr);
                if (capacity <= 0) {
                    tilCapacity.setError("Capacity must be greater than 0");
                    tilCapacity.setErrorEnabled(true);
                    isCapacityValid = false;
                } else if (capacity > 100) {
                    tilCapacity.setError("Capacity cannot exceed 100");
                    tilCapacity.setErrorEnabled(true);
                    isCapacityValid = false;
                } else {
                    tilCapacity.setError(null);
                    tilCapacity.setErrorEnabled(false);
                    isCapacityValid = true;
                }
            } catch (NumberFormatException e) {
                tilCapacity.setError("Please enter a valid number");
                tilCapacity.setErrorEnabled(true);
                isCapacityValid = false;
            }
        }
        updateSaveButtonState();
    }

    private void validateDuration(String durationStr) {
        if (TextUtils.isEmpty(durationStr)) {
            tilDuration.setError("Duration is required");
            tilDuration.setErrorEnabled(true);
            isDurationValid = false;
        } else {
            try {
                int duration = Integer.parseInt(durationStr);
                if (duration <= 0) {
                    tilDuration.setError("Duration must be greater than 0");
                    tilDuration.setErrorEnabled(true);
                    isDurationValid = false;
                } else if (duration > 300) {
                    tilDuration.setError("Duration cannot exceed 300 minutes");
                    tilDuration.setErrorEnabled(true);
                    isDurationValid = false;
                } else {
                    tilDuration.setError(null);
                    tilDuration.setErrorEnabled(false);
                    isDurationValid = true;
                }
            } catch (NumberFormatException e) {
                tilDuration.setError("Please enter a valid number");
                tilDuration.setErrorEnabled(true);
                isDurationValid = false;
            }
        }
        updateSaveButtonState();
    }

    private void validatePrice(String priceStr) {
        if (TextUtils.isEmpty(priceStr)) {
            tilPrice.setError("Price is required");
            tilPrice.setErrorEnabled(true);
            isPriceValid = false;
        } else {
            try {
                double price = Double.parseDouble(priceStr);
                if (price <= 0) {
                    tilPrice.setError("Price must be greater than £0");
                    tilPrice.setErrorEnabled(true);
                    isPriceValid = false;
                } else if (price > 1000) {
                    tilPrice.setError("Price cannot exceed £1000");
                    tilPrice.setErrorEnabled(true);
                    isPriceValid = false;
                } else {
                    tilPrice.setError(null);
                    tilPrice.setErrorEnabled(false);
                    isPriceValid = true;
                }
            } catch (NumberFormatException e) {
                tilPrice.setError("Please enter a valid price (e.g., 20.50)");
                tilPrice.setErrorEnabled(true);
                isPriceValid = false;
            }
        }
        updateSaveButtonState();
    }

    private void updateDescriptionCounter(String description) {
        int length = description.length();
        int maxLength = 500; // Set reasonable limit

        if (length > maxLength) {
            tilDescription.setError("Description too long (" + length + "/" + maxLength + ")");
            tilDescription.setErrorEnabled(true);
        } else {
            tilDescription.setError(null);
            tilDescription.setErrorEnabled(false);
            if (length > 0) {
                tilDescription.setHelperText(length + "/" + maxLength + " characters");
            } else {
                tilDescription.setHelperText("Add a description (optional)");
            }
        }
    }

    private void updateSaveButtonState() {
        boolean allValid = isCapacityValid && isDurationValid && isPriceValid;
        btnSave.setEnabled(allValid);

        // Visual feedback
        if (allValid) {
            btnSave.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_green_dark));
            btnSave.setText("Save Course");
        } else {
            btnSave.setBackgroundColor(ContextCompat.getColor(this, android.R.color.darker_gray));
            btnSave.setText("Please fix errors above");
        }
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

        // Trigger validation for existing data
        validateCapacity(String.valueOf(course.getCapacity()));
        validateDuration(String.valueOf(course.getDuration()));
        validatePrice(String.valueOf(course.getPrice()));
        updateDescriptionCounter(course.getDescription() != null ? course.getDescription() : "");
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
        if (!allFieldsValid()) {
            Toast.makeText(this, "Please fix all validation errors", Toast.LENGTH_SHORT).show();
            return;
        }

        // Check for duplicate course (same day, time, type)
        if (courseId == -1) { // Only check for duplicates when adding new course
            checkForDuplicateAndSave();
        } else {
            performSave();
        }
    }

    private boolean allFieldsValid() {
        return isCapacityValid && isDurationValid && isPriceValid;
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
                runOnUiThread(() -> {
                    Toast.makeText(this, "A course with the same day, time, and type already exists!", Toast.LENGTH_LONG).show();
                    // Visual feedback on conflicting fields
                    highlightDuplicateFields();
                });
            } else {
                performSave();
            }
        });
    }

    private void highlightDuplicateFields() {
        // Temporarily highlight the conflicting spinners
        spinnerDayOfWeek.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_red_light));
        spinnerTime.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_red_light));
        spinnerType.setBackgroundColor(ContextCompat.getColor(this, android.R.color.holo_red_light));

        // Reset background after 3 seconds
        spinnerDayOfWeek.postDelayed(() -> {
            spinnerDayOfWeek.setBackgroundColor(ContextCompat.getColor(this, android.R.color.transparent));
            spinnerTime.setBackgroundColor(ContextCompat.getColor(this, android.R.color.transparent));
            spinnerType.setBackgroundColor(ContextCompat.getColor(this, android.R.color.transparent));
        }, 3000);
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

        // Clear all validation states
        tilCapacity.setError(null);
        tilCapacity.setErrorEnabled(false);
        tilDuration.setError(null);
        tilDuration.setErrorEnabled(false);
        tilPrice.setError(null);
        tilPrice.setErrorEnabled(false);
        tilDescription.setError(null);
        tilDescription.setErrorEnabled(false);
        tilDescription.setHelperText("Add a description (optional)");

        // Reset validation flags
        isCapacityValid = false;
        isDurationValid = false;
        isPriceValid = false;
        updateSaveButtonState();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
}