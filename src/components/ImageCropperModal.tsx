import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, ZoomIn, Move, Check } from 'lucide-react';

interface ImageCropperModalProps {
  file: File;
  onCrop: (base64: string) => void;
  onClose: () => void;
}

export default function ImageCropperModal({ file, onCrop, onClose }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Load image file into an HTML Image object
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        // Reset controls
        setZoom(1.0);
        setOffsetX(0);
        setOffsetY(0);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Redraw preview whenever inputs or image loads
  useEffect(() => {
    if (!imageObj || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const size = canvas.width; // 300px width/height circular container
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 110; // Crop boundary circle

    // Draw darkened background first
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, size, size);

    // Save state for mask clipping
    ctx.save();
    
    // Create circular mask in the center
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip(); // Restrict further drawings into this circle

    // Draw clear white/light background inside the circle for transparency/contrast
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Calculate dimensions to maintain aspect ratio
    const imgRatio = imageObj.width / imageObj.height;
    let drawW = radius * 2;
    let drawH = radius * 2;
    
    if (imgRatio > 1) {
      // Landscape: fit height
      drawW = drawH * imgRatio;
    } else {
      // Portrait: fit width
      drawH = drawW / imgRatio;
    }

    // Apply zoom
    drawW *= zoom;
    drawH *= zoom;

    // Draw the image centered inside the cropping circle, offsetted by sliders
    const x = centerX - (drawW / 2) + offsetX;
    const y = centerY - (drawH / 2) + offsetY;

    ctx.drawImage(imageObj, x, y, drawW, drawH);
    ctx.restore();

    // Draw subtle green boundary outline on the cropping limit circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.strokeStyle = '#1ebd7d';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw text indicator indicating what part is cut out
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
  }, [imageObj, zoom, offsetX, offsetY]);

  const handleApply = () => {
    if (!imageObj || !canvasRef.current) return;

    // Create a square canvas to bake the 200x200 avatar image
    const bakedCanvas = document.createElement('canvas');
    bakedCanvas.width = 200;
    bakedCanvas.height = 200;
    const ctx = bakedCanvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, 200, 200);

    // Create solid circular clipping mask for final cropped avatar output file
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // We scale the math from 300px preview canvas down to 200px
    // Preview circular radius is 110px. Result circular radius is 100px.
    // Scale factor = 200 (final size) / 220 (preview area size)
    const scale = 200 / 220;

    const imgRatio = imageObj.width / imageObj.height;
    let drawW = 220;
    let drawH = 220;
    
    if (imgRatio > 1) {
      drawW = drawH * imgRatio;
    } else {
      drawH = drawW / imgRatio;
    }

    // Apply zoom and scale factor
    drawW *= zoom * scale;
    drawH *= zoom * scale;

    // Center in baked square (100, 100) and apply offsetsscaled
    const x = 100 - (drawW / 2) + (offsetX * scale);
    const y = 100 - (drawH / 2) + (offsetY * scale);

    // Draw
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 200, 200);
    ctx.drawImage(imageObj, x, y, drawW, drawH);

    // Get as optimized data URL
    const croppedDataUrl = bakedCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedDataUrl);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cream border border-border-soft rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-5 p-6 animate-fade-in text-natural-text">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white">Adjust & Size Photo</h3>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-natural border border-border-soft text-[#8c9e99] hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Dynamic Interactive Drawing Canvas Viewport */}
        <div className="flex justify-center select-none overflow-hidden rounded-2xl border border-border-soft relative bg-natural">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300} 
            className="w-[300px] h-[300px] block"
          />
          <div className="absolute bottom-2 text-[10px] text-gray-500 bg-natural/80 p-1 px-2.5 rounded-md border border-border-soft/50 font-mono">
            Adjust sliders to fit circular framing
          </div>
        </div>

        {/* Sliders Adjustment Panel */}
        <div className="space-y-4">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#8c9e99] uppercase font-mono">
              <span className="flex items-center gap-1 text-sage"><ZoomIn size={12} /> Size Zoom</span>
              <span className="text-white text-[11px]">{Math.round(zoom * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1 bg-natural rounded-lg appearance-none cursor-pointer accent-sage outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Shift Horizontal Offset slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#8c9e99] uppercase font-mono">
                <span className="flex items-center gap-1"><Move size={11} /> Shift Horiz</span>
                <span className="text-white text-[11px]">{offsetX}px</span>
              </div>
              <input 
                type="range"
                min="-150"
                max="150"
                step="1"
                value={offsetX}
                onChange={(e) => setOffsetX(parseInt(e.target.value))}
                className="w-full h-1 bg-natural rounded-lg appearance-none cursor-pointer accent-sage outline-none"
              />
            </div>

            {/* Shift Vertical Offset slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#8c9e99] uppercase font-mono">
                <span className="flex items-center gap-1"><Move size={11} className="rotate-90" /> Shift Vert</span>
                <span className="text-white text-[11px]">{offsetY}px</span>
              </div>
              <input 
                type="range"
                min="-150"
                max="150"
                step="1"
                value={offsetY}
                onChange={(e) => setOffsetY(parseInt(e.target.value))}
                className="w-full h-1 bg-natural rounded-lg appearance-none cursor-pointer accent-sage outline-none"
              />
            </div>
          </div>
        </div>

        {/* Confirmation buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-natural hover:bg-natural/70 border border-border-soft rounded-xl text-xs font-bold uppercase transition-colors text-[#8c9e99] hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 bg-sage hover:bg-sage/90 text-white font-bold rounded-xl text-xs uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-sage/10"
          >
            <Check size={14} />
            <span>Apply photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
