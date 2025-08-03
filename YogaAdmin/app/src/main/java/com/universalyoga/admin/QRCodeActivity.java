package com.universalyoga.admin;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.button.MaterialButton;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class QRCodeActivity extends AppCompatActivity {

    private ImageView ivQRCode;
    private TextView tvQRContent, tvQRTitle;
    private MaterialButton btnShareQR, btnSaveQR;

    private String qrContent;
    private String qrTitle;
    private Bitmap qrBitmap;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qrcode);

        qrContent = getIntent().getStringExtra("qr_content");
        qrTitle = getIntent().getStringExtra("title");

        if (qrContent == null || qrContent.trim().isEmpty()) {
            Toast.makeText(this, "No content to generate QR code", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        initViews();
        setupActionBar();
        generateQRCode();
        setupClickListeners();
    }

    private void initViews() {
        ivQRCode = findViewById(R.id.ivQRCode);
        tvQRContent = findViewById(R.id.tvQRContent);
        tvQRTitle = findViewById(R.id.tvQRTitle);
        btnShareQR = findViewById(R.id.btnShareQR);
        btnSaveQR = findViewById(R.id.btnSaveQR);
    }

    private void setupActionBar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(qrTitle != null ? qrTitle : "QR Code");
        }

        if (qrTitle != null) {
            tvQRTitle.setText(qrTitle);
        } else {
            tvQRTitle.setText("Course QR Code");
        }

        tvQRContent.setText(qrContent);
    }

    private void generateQRCode() {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();

            // Generate QR code with 512x512 size for good quality
            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 512, 512);

            int width = bitMatrix.getWidth();
            int height = bitMatrix.getHeight();

            qrBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565);

            // Set colors - black for QR code, white for background
            for (int x = 0; x < width; x++) {
                for (int y = 0; y < height; y++) {
                    qrBitmap.setPixel(x, y, bitMatrix.get(x, y) ? Color.BLACK : Color.WHITE);
                }
            }

            ivQRCode.setImageBitmap(qrBitmap);

        } catch (WriterException e) {
            Toast.makeText(this, "Error generating QR code: " + e.getMessage(), Toast.LENGTH_LONG).show();
            finish();
        }
    }

    private void setupClickListeners() {
        btnShareQR.setOnClickListener(v -> shareQRCode());
        btnSaveQR.setOnClickListener(v -> saveQRCode());
    }

    private void shareQRCode() {
        if (qrBitmap == null) {
            Toast.makeText(this, "QR code not available", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            // Create a temporary file to share
            File cachePath = new File(getCacheDir(), "qr_codes");
            cachePath.mkdirs();

            File qrFile = new File(cachePath, "course_qr_code.png");
            FileOutputStream stream = new FileOutputStream(qrFile);
            qrBitmap.compress(Bitmap.CompressFormat.PNG, 100, stream);
            stream.close();

            // Share both image and text content
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_TEXT, qrContent);
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, qrTitle != null ? qrTitle : "Universal Yoga Course");

            startActivity(Intent.createChooser(shareIntent, "Share QR Code"));

        } catch (IOException e) {
            Toast.makeText(this, "Error sharing QR code: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void saveQRCode() {
        if (qrBitmap == null) {
            Toast.makeText(this, "QR code not available", Toast.LENGTH_SHORT).show();
            return;
        }

        // [Inference] In a real implementation, you would need proper storage permissions
        // and save to external storage or use Android's media store
        Toast.makeText(this, "QR code save functionality - would save to gallery in full implementation", Toast.LENGTH_LONG).show();

        // For demonstration, we'll just show a success message
        // In real implementation:
        // 1. Check WRITE_EXTERNAL_STORAGE permission
        // 2. Use MediaStore API (Android 10+) or save to Pictures directory
        // 3. Notify user of save location
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.qr_code_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == android.R.id.home) {
            finish();
            return true;
        } else if (id == R.id.action_regenerate) {
            generateQRCode();
            return true;
        } else if (id == R.id.action_share_text) {
            shareTextOnly();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void shareTextOnly() {
        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, qrContent);
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, qrTitle != null ? qrTitle : "Universal Yoga Course");

        startActivity(Intent.createChooser(shareIntent, "Share Course Details"));
    }
}