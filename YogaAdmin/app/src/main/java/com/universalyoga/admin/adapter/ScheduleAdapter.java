package com.universalyoga.admin.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.universalyoga.admin.R;
import com.universalyoga.admin.data.entity.Schedule;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class ScheduleAdapter extends RecyclerView.Adapter<ScheduleAdapter.ScheduleViewHolder> {

    private List<Schedule> schedules = new ArrayList<>();
    private List<YogaCourse> courses = new ArrayList<>();
    private OnScheduleClickListener listener;
    private Context context;

    public interface OnScheduleClickListener {
        void onScheduleClick(Schedule schedule);
        void onScheduleEdit(Schedule schedule);
        void onScheduleDelete(Schedule schedule);
    }

    public ScheduleAdapter(Context context, OnScheduleClickListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setSchedules(List<Schedule> schedules, List<YogaCourse> courses) {
        this.schedules = schedules != null ? schedules : new ArrayList<>();
        this.courses = courses != null ? courses : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ScheduleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_schedule, parent, false);
        return new ScheduleViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ScheduleViewHolder holder, int position) {
        Schedule schedule = schedules.get(position);
        YogaCourse course = findCourseById(schedule.getCourseId());
        holder.bind(schedule, course, listener);
    }

    @Override
    public int getItemCount() {
        return schedules.size();
    }

    private YogaCourse findCourseById(int courseId) {
        for (YogaCourse course : courses) {
            if (course.getId() == courseId) {
                return course;
            }
        }
        return null; // Course not found
    }

    static class ScheduleViewHolder extends RecyclerView.ViewHolder {
        private TextView tvCourseInfo, tvDate, tvTeacher, tvComments, tvFormattedDate;
        private Button btnEdit, btnDelete;

        public ScheduleViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCourseInfo = itemView.findViewById(R.id.tvCourseInfo);
            tvDate = itemView.findViewById(R.id.tvDate);
            tvTeacher = itemView.findViewById(R.id.tvTeacher);
            tvComments = itemView.findViewById(R.id.tvComments);
            tvFormattedDate = itemView.findViewById(R.id.tvFormattedDate);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(Schedule schedule, YogaCourse course, OnScheduleClickListener listener) {
            // Display course information
            if (course != null) {
                String courseInfo = course.getType() + " • " +
                        course.getDayOfWeek() + " • " +
                        course.getTime() + " • " +
                        "£" + String.format("%.2f", course.getPrice());
                tvCourseInfo.setText(courseInfo);
            } else {
                tvCourseInfo.setText("Course not found (ID: " + schedule.getCourseId() + ")");
            }

            // Display schedule information
            tvDate.setText("Date: " + schedule.getDate());
            tvTeacher.setText("Teacher: " + schedule.getTeacher());

            // Format and display date in a more readable format
            tvFormattedDate.setText(formatDate(schedule.getDate()));

            // Handle comments
            if (schedule.getComments() != null && !schedule.getComments().trim().isEmpty()) {
                tvComments.setText("Comments: " + schedule.getComments());
                tvComments.setVisibility(View.VISIBLE);
            } else {
                tvComments.setVisibility(View.GONE);
            }

            // Click listeners
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onScheduleClick(schedule);
                }
            });

            btnEdit.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onScheduleEdit(schedule);
                }
            });

            btnDelete.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onScheduleDelete(schedule);
                }
            });
        }

        private String formatDate(String dateString) {
            try {
                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                SimpleDateFormat outputFormat = new SimpleDateFormat("EEE, MMM dd, yyyy", Locale.getDefault());
                Date date = inputFormat.parse(dateString);
                return outputFormat.format(date);
            } catch (ParseException e) {
                return dateString; // Return original if parsing fails
            }
        }
    }
}