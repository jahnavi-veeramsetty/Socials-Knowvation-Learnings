import React, { useState, useEffect, useCallback } from 'react';
import { Image, X, Upload, Plus, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const ImageUploadSection = ({ onImagesChange, initialImages = [], readOnly = false }) => {
    const [images, setImages] = useState(initialImages);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    useEffect(() => {
        if (initialImages && initialImages.length > 0) setImages(initialImages);
    }, [initialImages]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newImages = files.map(file => ({ url: URL.createObjectURL(file), file, name: file.name }));
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        if (onImagesChange) onImagesChange(updatedImages);
    };

    const removeImage = (index, e) => {
        e.stopPropagation();
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        if (onImagesChange) onImagesChange(updatedImages);
        if (selectedImageIndex === index) setSelectedImageIndex(null);
        else if (selectedImageIndex > index) setSelectedImageIndex(selectedImageIndex - 1);
    };

    const nextImage = useCallback(() => {
        if (selectedImageIndex === null) return;
        setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }, [selectedImageIndex, images.length]);

    const prevImage = useCallback(() => {
        if (selectedImageIndex === null) return;
        setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    }, [selectedImageIndex, images.length]);

    const closeLightbox = () => setSelectedImageIndex(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImageIndex === null) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };
        if (selectedImageIndex !== null) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = 'unset'; };
    }, [selectedImageIndex, nextImage, prevImage]);

    return (
        <div className="flex flex-col gap-5 mt-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5 text-sm font-bold text-slate-500">
                    <Image size={16} />
                    Images / Visual Assets
                </div>
                {!readOnly && images.length > 0 && (
                    <label className="flex items-center gap-2 py-2 px-4 bg-blue-500/10 text-blue-400 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 border border-blue-500/10 hover:bg-blue-500/20">
                        <Plus size={16} />Add More
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden bg-black/20 border-2 border-slate-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_10px_20px_rgba(0,0,0,0.3)] group"
                        onClick={() => setSelectedImageIndex(index)}
                    >
                        {!readOnly && (
                            <button
                                className="absolute top-2 right-2 bg-red-500/90 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-200 z-10 opacity-0 scale-80 group-hover:opacity-100 group-hover:scale-100 hover:bg-red-500"
                                onClick={(e) => removeImage(index, e)}
                                title="Remove image"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <Maximize2 size={24} color="white" />
                        </div>
                        <img src={img.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                ))}

                {!readOnly && images.length === 0 && (
                    <label className="col-span-full py-14 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-4 text-slate-500 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:bg-blue-500/5 hover:text-slate-500">
                        <div className="w-16 h-16 rounded-[20px] bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
                            <Upload size={32} />
                        </div>
                        <div className="text-center">
                            <div className="font-extrabold text-lg text-slate-600 mb-2">Upload Content Visuals</div>
                            <div className="text-sm text-slate-500">Drag and drop images or click to browse</div>
                        </div>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                )}
            </div>

            {/* Lightbox */}
            {selectedImageIndex !== null && (
                <div className="fixed inset-0 bg-[rgba(1,13,44,0.95)] backdrop-blur-[10px] z-[2000] flex items-center justify-center animate-[fadeIn_0.3s_ease]"
                    onClick={closeLightbox}>
                    <div className="relative w-screen h-screen flex items-center justify-center p-[60px] box-border"
                        onClick={e => e.stopPropagation()}>
                        <button className="fixed top-[30px] right-[30px] bg-slate-200 border-none text-slate-900 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer opacity-70 transition-all duration-200 z-[2100] backdrop-blur-sm hover:opacity-100"
                            onClick={closeLightbox}>
                            <X size={32} />
                        </button>

                        {images.length > 1 && (
                            <>
                                <button className="absolute left-10 top-1/2 -translate-y-1/2 bg-slate-100 border border-slate-200 text-slate-900 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-slate-200 hover:border-slate-300"
                                    onClick={prevImage}>
                                    <ChevronLeft size={32} />
                                </button>
                                <button className="absolute right-10 top-1/2 -translate-y-1/2 bg-slate-100 border border-slate-200 text-slate-900 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-slate-200 hover:border-slate-300"
                                    onClick={nextImage}>
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        <img
                            src={images[selectedImageIndex].url}
                            alt="Zoomed"
                            className="max-w-full max-h-full object-contain shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[4px] animate-[zoomIn_0.3s_cubic-bezier(0.4,0,0.2,1)]"
                        />

                        <div className="fixed bottom-[30px] left-1/2 -translate-x-1/2 text-slate-500 text-sm font-bold bg-black/40 py-1.5 px-4 rounded-[20px] backdrop-blur-sm">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadSection;
