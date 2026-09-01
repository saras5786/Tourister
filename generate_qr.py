import qrcode

# The permanent live URL for your Tourister web app
URL = "https://saras5786.github.io/Tourister/"

# Configure QR code with High Error Correction (Level H allows up to 30% damage/distortion recovery)
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=4,
)

qr.add_data(URL)
qr.make(fit=True)

# Generate image with dark slate modules on a clean white background
img = qr.make_image(fill_color="#0f172a", back_color="#ffffff")

# Save as PNG
output_file = "tourister_qr_code.png"
img.save(output_file)

print(f"✅ Permanent QR Code successfully generated: {output_file}")
print(f"🔗 Encoded URL: {URL}")
