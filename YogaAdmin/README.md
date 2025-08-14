# YogaAdmin - Yoga Studio Management System

## Overview

YogaAdmin is an Android application designed for yoga studio administrators to manage yoga courses, schedules, and studio operations. Built with Java and Android SDK, it provides a comprehensive management interface with local SQLite database and Firebase cloud synchronization.

## Features

### 1. Course Management System

**Core Files:**

- `MainActivity.java` - Main course listing and management
- `AddEditCourseActivity.java` - Course creation and editing
- `CourseDetailActivity.java` - Course details and operations
- `YogaCourseAdapter.java` - RecyclerView adapter for course display

**Key Features:**

- **Course Listing**: Display all yoga courses with search and filter capabilities
- **Course Creation**: Add new yoga courses with comprehensive validation
- **Course Editing**: Modify existing course details
- **Course Deletion**: Remove courses with confirmation dialog
- **Real-time Search**: Search courses by type, day, or time
- **Swipe Refresh**: Pull-to-refresh functionality for course list

**Core Code Implementation:**

```java
// Course listing with search functionality
private void searchCourses(String query) {
    executor.execute(() -> {
        List<YogaCourse> courses = dao.searchCourses(query.trim());
        runOnUiThread(() -> {
            updateUI(courses);
            swipeRefreshLayout.setRefreshing(false);
        });
    });
}

// Real-time validation in AddEditCourseActivity
private void validateCapacity(String capacityStr) {
    try {
        int capacity = Integer.parseInt(capacityStr);
        if (capacity > 0 && capacity <= 100) {
            isCapacityValid = true;
            tilCapacity.setError(null);
        } else {
            isCapacityValid = false;
            tilCapacity.setError("Capacity must be between 1-100");
        }
    } catch (NumberFormatException e) {
        isCapacityValid = false;
        tilCapacity.setError("Please enter a valid number");
    }
    updateSaveButtonState();
}
```

### 2. Schedule Management System

**Core Files:**

- `ScheduleActivity.java` - Schedule listing and management
- `AddEditScheduleActivity.java` - Schedule creation and editing
- `ScheduleDetailActivity.java` - Schedule details and operations
- `ScheduleAdapter.java` - RecyclerView adapter for schedule display

**Key Features:**

- **Schedule Listing**: View all class schedules with filtering options
- **Schedule Creation**: Create new class schedules linked to courses
- **Schedule Editing**: Modify schedule details including teacher and comments
- **Course Filtering**: Filter schedules by specific yoga course
- **Date-based Organization**: Schedules organized by date and time

**Core Code Implementation:**

```java
// Schedule filtering by course
private void setupCourseFilterSpinner() {
    List<String> courseNames = new ArrayList<>();
    courseNames.add("All Courses");

    for (YogaCourse course : allCourses) {
        courseNames.add(course.getType() + " (" + course.getDayOfWeek() + " " + course.getTime() + ")");
    }

    ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
        android.R.layout.simple_spinner_item, courseNames);
    adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
    spinnerCourseFilter.setAdapter(adapter);
}
```

### 3. QR Code Generation System

**Core Files:**

- `QRCodeActivity.java` - QR code generation and display
- `CourseDetailActivity.java` - QR code generation triggers

**Key Features:**

- **QR Code Generation**: Generate QR codes for course information
- **QR Code Sharing**: Share QR codes via messaging or social media
- **QR Code Saving**: Save QR codes to device gallery
- **Custom QR Content**: QR codes contain course details and booking links

**Core Code Implementation:**

```java
// QR code generation using ZXing library
private void generateQRCode() {
    try {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrContent,
            BarcodeFormat.QR_CODE, 512, 512);

        int width = bitMatrix.getWidth();
        int height = bitMatrix.getHeight();
        qrBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                qrBitmap.setPixel(x, y, bitMatrix.get(x, y) ? Color.BLACK : Color.WHITE);
            }
        }
        ivQRCode.setImageBitmap(qrBitmap);
    } catch (WriterException e) {
        Toast.makeText(this, "Error generating QR code", Toast.LENGTH_SHORT).show();
    }
}
```

### 4. Firebase Cloud Synchronization

**Core Files:**

- `FirebaseSync.java` - Firebase synchronization utilities
- `MainActivity.java` - Sync trigger implementation

**Key Features:**

- **Smart Sync**: Intelligent synchronization that handles additions, updates, and deletions
- **Offline Support**: Local SQLite database with cloud sync when online
- **Conflict Resolution**: Handles data conflicts between local and cloud
- **Network Detection**: Automatic network connectivity checking
- **Batch Operations**: Efficient batch writes for better performance

**Core Code Implementation:**

```java
// Smart sync implementation
public void smartSyncCoursesToFirestore(List<YogaCourse> courses, SyncCallback callback) {
    if (!isFirebaseConfigured()) {
        callback.onError("Firebase not configured");
        return;
    }

    // Get existing courses from Firestore
    db.collection(COURSES_COLLECTION).get()
        .addOnSuccessListener(querySnapshot -> {
            Set<String> existingIds = new HashSet<>();
            for (QueryDocumentSnapshot doc : querySnapshot) {
                existingIds.add(doc.getId());
            }

            // Determine what to add, update, or delete
            Set<String> currentIds = new HashSet<>();
            for (YogaCourse course : courses) {
                currentIds.add(String.valueOf(course.getId()));
            }

            // Perform batch operations
            WriteBatch batch = db.batch();
            // ... batch operations
        });
}
```

### 5. Database Management System

**Core Files:**

- `AppDatabase.java` - Room database configuration
- `YogaCourseDao.java` - Data access object for courses
- `ScheduleDao.java` - Data access object for schedules
- `DatabaseHelper.java` - Database helper utilities

**Key Features:**

- **Room Database**: Modern Android database with SQLite
- **Entity Relationships**: Foreign key relationships between courses and schedules
- **Cascade Operations**: Automatic deletion of related schedules when courses are deleted
- **Search Queries**: Complex search functionality across multiple fields
- **Data Validation**: Input validation and data integrity checks

**Core Code Implementation:**

```java
// Database entity with foreign key relationship
@Entity(tableName = "schedules",
        foreignKeys = @ForeignKey(entity = YogaCourse.class,
                                parentColumns = "id",
                                childColumns = "courseId",
                                onDelete = CASCADE))
public class Schedule {
    @PrimaryKey(autoGenerate = true)
    private int id;

    @ColumnInfo(name = "courseId")
    private int courseId;

    // ... other fields
}

// Search functionality in DAO
@Query("SELECT * FROM yoga_courses WHERE type LIKE '%' || :query || '%' " +
        "OR dayOfWeek LIKE '%' || :query || '%' " +
        "OR time LIKE '%' || :query || '%' " +
        "ORDER BY dayOfWeek, time")
List<YogaCourse> searchCourses(String query);
```

### 6. User Interface Features

**Core Files:**

- Layout files in `res/layout/`
- Menu files in `res/menu/`
- Drawable resources in `res/drawable/`

**Key Features:**

- **Material Design**: Modern Android Material Design components
- **Responsive Layout**: Adaptive layouts for different screen sizes
- **Custom Animations**: Smooth transitions and loading animations
- **Accessibility**: Proper accessibility labels and descriptions
- **Dark/Light Theme**: Support for both light and dark themes

### 7. Data Export and Management

**Core Files:**

- `MainActivity.java` - Export functionality
- `FirebaseSync.java` - Data reset and management

**Key Features:**

- **Database Reset**: Complete database reset with confirmation
- **Cloud Data Management**: Reset both local and cloud data
- **Export Functionality**: Export data to CSV or JSON (planned)
- **Backup and Restore**: Data backup capabilities

## Technical Architecture

### Database Schema

- **YogaCourse Table**: Stores course information (id, dayOfWeek, time, capacity, duration, price, type, description)
- **Schedule Table**: Stores schedule information (id, courseId, date, teacher, comments) with foreign key relationship

### Firebase Collections

- **yoga_courses**: Mirrors local YogaCourse entities
- **schedules**: Mirrors local Schedule entities
- **bookings**: Customer booking information (for customer app integration)

### Key Dependencies

- **Room Database**: For local data persistence
- **Firebase Firestore**: For cloud synchronization
- **ZXing**: For QR code generation
- **Material Design Components**: For modern UI

## Installation and Setup

1. **Prerequisites:**

   - Android Studio 4.0+
   - Android SDK API 21+
   - Google Services configuration

2. **Setup Steps:**

   - Clone the repository
   - Add `google-services.json` to the app directory
   - Configure Firebase project settings
   - Build and run the application

3. **Configuration:**
   - Firebase project setup required
   - Firestore security rules configuration
   - Google Services API key setup

## Usage Instructions

1. **Course Management:**

   - Tap the floating action button to add new courses
   - Use search functionality to find specific courses
   - Swipe to refresh the course list
   - Long press courses for edit/delete options

2. **Schedule Management:**

   - Navigate to Schedule tab to manage class schedules
   - Filter schedules by course type
   - Add new schedules with teacher assignments
   - Edit existing schedules as needed

3. **QR Code Generation:**

   - View course details to generate QR codes
   - Share QR codes with customers
   - Save QR codes to device gallery

4. **Data Synchronization:**
   - Use menu options to sync with Firebase
   - Reset database when needed
   - Export data for backup purposes

## Security Features

- **Input Validation**: Comprehensive validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries in Room DAO
- **Firebase Security**: Firestore security rules for data protection
- **Error Handling**: Graceful error handling and user feedback

## Performance Optimizations

- **Background Threading**: All database operations on background threads
- **Batch Operations**: Efficient Firebase batch writes
- **Lazy Loading**: RecyclerView with efficient item loading
- **Memory Management**: Proper resource cleanup and lifecycle management

## Future Enhancements

- **Advanced Analytics**: Course popularity and booking analytics
- **Multi-language Support**: Internationalization for global studios
- **Advanced Export**: PDF reports and detailed analytics
- **Push Notifications**: Real-time notifications for schedule changes
- **Offline Mode**: Enhanced offline functionality with sync queues
