package com.universalyoga.admin;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.SearchView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.universalyoga.admin.adapter.YogaCourseAdapter;
import com.universalyoga.admin.data.database.AppDatabase;
import com.universalyoga.admin.data.dao.YogaCourseDao;
import com.universalyoga.admin.data.entity.YogaCourse;
import com.universalyoga.admin.data.entity.Schedule;
import com.universalyoga.admin.utils.FirebaseSync;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends AppCompatActivity implements YogaCourseAdapter.OnCourseClickListener {

    private RecyclerView recyclerCourses;
    private androidx.constraintlayout.widget.ConstraintLayout tvEmptyState;
    private FloatingActionButton fabAddCourse;
    private SwipeRefreshLayout swipeRefreshLayout;
    private SearchView searchView;

    private YogaCourseAdapter adapter;
    private YogaCourseDao dao;
    private ExecutorService executor;
    private FirebaseSync firebaseSync;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        initDatabase();
        setupRecyclerView();
        setupClickListeners();
        setupSwipeRefresh();
        loadCourses();
    }

    private void initViews() {
        recyclerCourses = findViewById(R.id.recyclerCourses);
        tvEmptyState = findViewById(R.id.tvEmptyState);
        fabAddCourse = findViewById(R.id.fabAddCourse);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);
    }

    private void initDatabase() {
        dao = AppDatabase.getInstance(this).yogaCourseDao();
        executor = Executors.newSingleThreadExecutor();
        firebaseSync = new FirebaseSync(this);
    }

    private void setupRecyclerView() {
        recyclerCourses.setLayoutManager(new LinearLayoutManager(this));
        adapter = new YogaCourseAdapter(this);
        recyclerCourses.setAdapter(adapter);
    }

    private void setupClickListeners() {
        fabAddCourse.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, AddEditCourseActivity.class);
            startActivity(intent);
        });

        // View Schedule button - now properly implemented
        findViewById(R.id.btnViewSchedule).setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, ScheduleActivity.class);
            startActivity(intent);
        });

        // Search functionality - now implemented
        findViewById(R.id.btnSearch).setOnClickListener(v -> toggleSearch());
    }

    private void setupSwipeRefresh() {
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setOnRefreshListener(this::loadCourses);
            swipeRefreshLayout.setColorSchemeResources(
                    android.R.color.holo_blue_bright,
                    android.R.color.holo_green_light,
                    android.R.color.holo_orange_light,
                    android.R.color.holo_red_light
            );
        }
    }

    private void toggleSearch() {
        if (searchView == null) {
            searchView = findViewById(R.id.searchView);
        }

        if (searchView.getVisibility() == View.GONE) {
            searchView.setVisibility(View.VISIBLE);
            searchView.requestFocus();
            setupSearchView();
        } else {
            searchView.setVisibility(View.GONE);
            loadCourses(); // Reset to show all courses
        }
    }

    private void setupSearchView() {
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                searchCourses(query);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                if (newText.trim().isEmpty()) {
                    loadCourses();
                } else {
                    searchCourses(newText);
                }
                return true;
            }
        });

        searchView.setOnCloseListener(() -> {
            searchView.setVisibility(View.GONE);
            loadCourses();
            return false;
        });
    }

    private void searchCourses(String query) {
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(true);
        }

        executor.execute(() -> {
            List<YogaCourse> courses = dao.searchCourses(query.trim());
            runOnUiThread(() -> {
                updateUI(courses);
                if (swipeRefreshLayout != null) {
                    swipeRefreshLayout.setRefreshing(false);
                }
            });
        });
    }

    private void loadCourses() {
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(true);
        }

        executor.execute(() -> {
            List<YogaCourse> courses = dao.getAllCourses();
            runOnUiThread(() -> {
                updateUI(courses);
                if (swipeRefreshLayout != null) {
                    swipeRefreshLayout.setRefreshing(false);
                }
            });
        });
    }

    private void updateUI(List<YogaCourse> courses) {
        if (courses != null && !courses.isEmpty()) {
            adapter.setCourses(courses);
            recyclerCourses.setVisibility(View.VISIBLE);
            tvEmptyState.setVisibility(View.GONE);
        } else {
            recyclerCourses.setVisibility(View.GONE);
            tvEmptyState.setVisibility(View.VISIBLE);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadCourses();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_reset_database) {
            showResetDatabaseDialog();
            return true;
        } else if (id == R.id.action_sync_firebase) {
            syncWithFirebase();
            return true;
        } else if (id == R.id.action_export_data) {
            exportData();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void showResetDatabaseDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Reset Database")
                .setMessage("Are you sure you want to delete all yoga courses and schedules? This action cannot be undone.")
                .setPositiveButton("Yes, Reset", (dialog, which) -> resetDatabase())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void resetDatabase() {
        // Show a progress dialog or loading state
        runOnUiThread(() -> Toast.makeText(this, "Resetting database and cloud data...", Toast.LENGTH_SHORT).show());

        executor.execute(() -> {
            // Step 1: Clear local SQLite database
            dao.deleteAllCourses();
            // Schedules will be automatically deleted due to CASCADE foreign key

            // Step 2: Clear Firestore data
            firebaseSync.resetFirestoreDatabase(new FirebaseSync.SyncCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "✅ Database and cloud data reset successfully!", Toast.LENGTH_SHORT).show();
                        loadCourses(); // Refresh the UI
                    });
                }

                @Override
                public void onError(String error) {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "⚠️ Local database reset, but cloud sync failed: " + error, Toast.LENGTH_LONG).show();
                        loadCourses(); // Still refresh the UI to show local changes
                    });
                }
            });
        });
    }

    private void syncWithFirebase() {
        Toast.makeText(this, "Starting smart Firebase sync...", Toast.LENGTH_SHORT).show();

        executor.execute(() -> {
            List<YogaCourse> courses = dao.getAllCourses();

            // Use smart sync that handles additions, updates, and deletions
            firebaseSync.smartSyncCoursesToFirestore(courses, new FirebaseSync.SyncCallback() {
                @Override
                public void onSuccess() {
                    // Also sync schedules
                    executor.execute(() -> {
                        List<Schedule> schedules = AppDatabase.getInstance(MainActivity.this).scheduleDao().getAllSchedules();

                        firebaseSync.smartSyncSchedulesToFirestore(schedules, new FirebaseSync.SyncCallback() {
                            @Override
                            public void onSuccess() {
                                runOnUiThread(() ->
                                        Toast.makeText(MainActivity.this, "Complete sync finished successfully!", Toast.LENGTH_SHORT).show()
                                );
                            }

                            @Override
                            public void onError(String error) {
                                runOnUiThread(() ->
                                        Toast.makeText(MainActivity.this, "Courses synced, but schedules sync failed: " + error, Toast.LENGTH_LONG).show()
                                );
                            }
                        });
                    });
                }

                @Override
                public void onError(String error) {
                    runOnUiThread(() ->
                            Toast.makeText(MainActivity.this, "Sync failed: " + error, Toast.LENGTH_LONG).show()
                    );
                }
            });
        });
    }

    private void exportData() {
        // TODO: Implement data export functionality (CSV, JSON)
        Toast.makeText(this, "Export functionality coming soon!", Toast.LENGTH_SHORT).show();
    }

    // YogaCourseAdapter.OnCourseClickListener implementation
    @Override
    public void onCourseClick(YogaCourse course) {
        Intent intent = new Intent(this, CourseDetailActivity.class);
        intent.putExtra("course_id", course.getId());
        startActivity(intent);
    }

    @Override
    public void onCourseEdit(YogaCourse course) {
        Intent intent = new Intent(this, AddEditCourseActivity.class);
        intent.putExtra("course_id", course.getId());
        startActivity(intent);
    }

    @Override
    public void onCourseDelete(YogaCourse course) {
        new AlertDialog.Builder(this)
                .setTitle("Delete Course")
                .setMessage("Are you sure you want to delete this course: " + course.getType() + "?\n\nThis will also delete all associated schedules.")
                .setPositiveButton("Delete", (dialog, which) -> deleteCourse(course))
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void deleteCourse(YogaCourse course) {
        executor.execute(() -> {
            // Delete from local database first
            dao.delete(course);
            // Associated schedules will be automatically deleted due to CASCADE

            // Then delete from Firestore
            firebaseSync.deleteCourseFromFirestore(course.getId(), new FirebaseSync.SyncCallback() {
                @Override
                public void onSuccess() {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "Course deleted successfully from both local and cloud", Toast.LENGTH_SHORT).show();
                        loadCourses();
                    });
                }

                @Override
                public void onError(String error) {
                    runOnUiThread(() -> {
                        Toast.makeText(MainActivity.this, "Course deleted locally, but cloud deletion failed: " + error, Toast.LENGTH_LONG).show();
                        loadCourses();
                    });
                }
            });
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
    }
}