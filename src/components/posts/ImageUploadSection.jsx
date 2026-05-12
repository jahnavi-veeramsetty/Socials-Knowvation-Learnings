import React, { useState, useEffect, useCallback } from 'react';
import { Image, X, Upload, Plus, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const ImageUploadSection = ({ onImagesChange, initialImages = [], readOnly = false }) => {
    const [images, setImages] = useState(initialImages);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    useEffect(() => {
        if (initialImages && initialImages.length > 0) {
            setImages(initialImages);
        }
    }, [initialImages]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map(file => ({
            url: URL.createObjectURL(file),
            file: file,
            name: file.name
        }));

        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        if (onImagesChange) onImagesChange(updatedImages);
    };

    const removeImage = (index, e) => {
        e.stopPropagation();
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        if (onImagesChange) onImagesChange(updatedImages);
        if (selectedImageIndex === index) {
            setSelectedImageIndex(null);
        } else if (selectedImageIndex > index) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
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

        if (selectedImageIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [selectedImageIndex, nextImage, prevImage]);

    return (
        <div className="image-upload-section">
            <style>{`
                .image-upload-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-top: 20px;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    color: #64748b;
                }

                .upload-trigger {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                }

                .upload-trigger:hover {
                    background: rgba(59, 130, 246, 0.2);
                }

                .images-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 16px;
                }

                .image-item {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 12px;
                    overflow: hidden;
                    background: rgba(0, 0, 0, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .image-item:hover {
                    transform: translateY(-4px);
                    border-color: #3b82f6;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                }

                .image-thumbnail {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }

                .image-item:hover .image-thumbnail {
                    transform: scale(1.1);
                }

                .remove-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(239, 68, 68, 0.9);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    z-index: 10;
                    opacity: 0;
                    transform: scale(0.8);
                }

                .image-item:hover .remove-btn {
                    opacity: 1;
                    transform: scale(1);
                }

                .remove-btn:hover {
                    background: #ef4444;
                    transform: scale(1.1) !important;
                }

                .zoom-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .image-item:hover .zoom-overlay {
                    opacity: 1;
                }

                .empty-state {
                    grid-column: 1 / -1;
                    padding: 60px;
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .empty-state:hover {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.05);
                    color: #94a3b8;
                }

                /* Lightbox Styles */
                .lightbox-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(1, 13, 44, 0.95);
                    backdrop-filter: blur(10px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .lightbox-content {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    box-sizing: border-box;
                }

                .lightbox-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    border-radius: 4px;
                    animation: zoomIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes zoomIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .lightbox-close {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: all 0.2s;
                    z-index: 2100;
                    backdrop-filter: blur(4px);
                }

                .lightbox-close:hover {
                    opacity: 1;
                }

                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    backdrop-filter: blur(4px);
                }

                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.3);
                    transform: translateY(-50%) scale(1.1);
                }

                .nav-btn.prev { left: 40px; }
                .nav-btn.next { right: 40px; }

                @media (max-width: 1000px) {
                    .nav-btn.prev { left: 20px; }
                    .nav-btn.next { right: 20px; }
                    .lightbox-content { padding: 40px; }
                }

                .image-counter {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: #94a3b8;
                    font-size: 14px;
                    font-weight: 700;
                    background: rgba(0, 0, 0, 0.4);
                    padding: 6px 16px;
                    border-radius: 20px;
                    backdrop-filter: blur(4px);
                }
            `}</style>

            <div className="section-header">
                <div className="section-title">
                    <Image size={16} />
                    Images / Visual Assets
                </div>
                {!readOnly && images.length > 0 && (
                    <label className="upload-trigger">
                        <Plus size={16} />
                        Add More
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            <div className="images-grid">
                {images.map((img, index) => (
                    <div 
                        key={index} 
                        className="image-item"
                        onClick={() => setSelectedImageIndex(index)}
                    >
                        {!readOnly && (
                            <button
                                className="remove-btn"
                                onClick={(e) => removeImage(index, e)}
                                title="Remove image"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <div className="zoom-overlay">
                            <Maximize2 size={24} color="white" />
                        </div>
                        <img
                            src={img.url}
                            alt={`Upload ${index + 1}`}
                            className="image-thumbnail"
                        />
                    </div>
                ))}

                {!readOnly && images.length === 0 && (
                    <label className="empty-state">
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '20px', 
                            background: 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6',
                            marginBottom: '12px'
                        }}>
                            <Upload size={32} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 800, fontSize: '18px', color: '#cbd5e1', marginBottom: '8px' }}>Upload Content Visuals</div>
                            <div style={{ fontSize: '14px', color: '#64748b' }}>Drag and drop images or click to browse</div>
                        </div>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImageIndex !== null && (
                <div className="lightbox-overlay" onClick={closeLightbox}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={closeLightbox}>
                            <X size={32} />
                        </button>

                        {images.length > 1 && (
                            <>
                                <button className="nav-btn prev" onClick={prevImage}>
                                    <ChevronLeft size={32} />
                                </button>
                                <button className="nav-btn next" onClick={nextImage}>
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        <img 
                            src={images[selectedImageIndex].url} 
                            alt="Zoomed" 
                            className="lightbox-image"
                        />

                        <div className="image-counter">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadSection;
