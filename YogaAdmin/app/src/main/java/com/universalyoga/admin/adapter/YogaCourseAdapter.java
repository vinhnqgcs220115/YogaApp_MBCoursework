package com.universalyoga.admin.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.universalyoga.admin.R;
import com.universalyoga.admin.data.entity.YogaCourse;

import java.util.ArrayList;
import java.util.List;

public class YogaCourseAdapter extends RecyclerView.Adapter<YogaCourseAdapter.CourseViewHolder> {

    private List<YogaCourse> courses = new ArrayList<>();
    private OnCourseClickListener listener;

    public interface OnCourseClickListener {
        void onCourseClick(YogaCourse course);
        void onCourseEdit(YogaCourse course);
        void onCourseDelete(YogaCourse course);
    }

    public YogaCourseAdapter(OnCourseClickListener listener) {
        this.listener = listener;
    }

    public void setCourses(List<YogaCourse> courses) {
        this.courses = courses != null ? courses : new ArrayList<>();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public CourseViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_yoga_course, parent, false);
        return new CourseViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CourseViewHolder holder, int position) {
        YogaCourse course = courses.get(position);
        holder.bind(course, listener);
    }

    @Override
    public int getItemCount() {
        return courses.size();
    }

    static class CourseViewHolder extends RecyclerView.ViewHolder {
        private TextView tvType, tvDay, tvTime, tvPrice, tvCapacity, tvDuration;
        private Button btnEdit, btnDelete;

        public CourseViewHolder(@NonNull View itemView) {
            super(itemView);
            tvType = itemView.findViewById(R.id.tvType);
            tvDay = itemView.findViewById(R.id.tvDay);
            tvTime = itemView.findViewById(R.id.tvTime);
            tvPrice = itemView.findViewById(R.id.tvPrice);
            tvCapacity = itemView.findViewById(R.id.tvCapacity);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }

        public void bind(YogaCourse course, OnCourseClickListener listener) {
            tvType.setText(course.getType());
            tvDay.setText(course.getDayOfWeek());
            tvTime.setText(course.getTime());
            tvPrice.setText("£" + String.format("%.2f", course.getPrice()));
            tvCapacity.setText("Capacity: " + course.getCapacity());
            tvDuration.setText(course.getDuration() + " min");

            // Click on entire item
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onCourseClick(course);
                }
            });

            // Edit button
            btnEdit.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onCourseEdit(course);
                }
            });

            // Delete button
            btnDelete.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onCourseDelete(course);
                }
            });
        }
    }
}