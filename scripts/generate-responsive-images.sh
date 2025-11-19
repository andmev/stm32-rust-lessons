#!/bin/bash

# Generate responsive images for web using macOS sips utility
# This script creates multiple sizes of each image for responsive loading

set -e

SCRIPT_DIR=$(dirname "$0")
ASSETS_DIR="$SCRIPT_DIR/../src/assets"
SIZES=("tiny:20" "small:200" "medium:400" "large:600")

echo "🖼️  Generating responsive images..."
echo "=================================="

# Check if assets directory exists
if [ ! -d "$ASSETS_DIR" ]; then
    echo "❌ Error: Assets directory not found at $ASSETS_DIR"
    exit 1
fi

# Clean up old generated files
echo ""
echo "🧹 Cleaning up old generated files..."
for size_dir in tiny small medium large; do
    if [ -d "$ASSETS_DIR/$size_dir" ]; then
        rm -rf "$ASSETS_DIR/${size_dir:?}"
        echo "  ✓ Removed $ASSETS_DIR/$size_dir"
    fi
done

# Process each PNG file in assets directory
for original in "$ASSETS_DIR"/*.png; do
    # Skip if no PNG files found
    [ -e "$original" ] || continue
    
    filename=$(basename "$original" .png)
    echo ""
    echo "📸 Processing: $filename.png"
    
    # Create size variants
    for size_spec in "${SIZES[@]}"; do
        size_name="${size_spec%%:*}"
        size_width="${size_spec##*:}"
        
        # Create output directory
        output_dir="$ASSETS_DIR/$size_name"
        mkdir -p "$output_dir"
        
        output_png="$output_dir/${filename}.png"
        output_webp="$output_dir/${filename}.webp"
        
        echo "  → Generating ${size_name} (${size_width}px)..."
        
        # Resize PNG using sips
        if [ "$size_name" = "tiny" ]; then
            # For tiny images, use lower quality JPEG as placeholder
            output_jpg="$output_dir/${filename}.jpg"
            sips -Z "$size_width" "$original" --out "$output_jpg" > /dev/null 2>&1
            # Convert to low quality JPEG for blur placeholder
            sips -s format jpeg -s formatOptions 20 "$output_jpg" --out "$output_jpg" > /dev/null 2>&1
            echo "     ✓ Created blur placeholder: $output_jpg"
        else
            # Resize to target width maintaining aspect ratio
            sips -Z "$size_width" "$original" --out "$output_png" > /dev/null 2>&1
            echo "     ✓ PNG: $output_png"
            
            # Convert to WebP with alpha channel preservation
            if command -v cwebp &> /dev/null; then
                # Use -alpha_q to preserve transparency quality
                cwebp -q 85 -alpha_q 100 "$output_png" -o "$output_webp" > /dev/null 2>&1
                echo "     ✓ WebP (with alpha): $output_webp"
            fi
        fi
    done
done

echo ""
echo "=================================="
echo "✅ Image generation complete!"
echo ""
echo "📊 Summary:"
echo "   - Generated sizes: tiny (20px), small (200px), medium (400px), large (600px)"
echo "   - Formats: PNG (all sizes), JPEG (tiny blur), WebP (if cwebp installed)"
echo ""

# Check if cwebp is available
if ! command -v cwebp &> /dev/null; then
    echo "💡 Tip: Install webp for better compression:"
    echo "   brew install webp"
    echo "   Then run this script again to generate WebP versions"
    echo ""
fi

echo "🎉 Ready to use responsive images in your application!"
