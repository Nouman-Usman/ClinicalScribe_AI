
import { useState, useRef } from 'react';
import { Upload, X, FileImage, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageUploaderProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
    resetAnalysis: () => void;
}

export function ImageUploader({ onFileSelect, selectedFile, resetAnalysis }: ImageUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const validExtensions = ['png', 'jpg', 'jpeg', 'dcm', 'nii', 'dicom'];
        const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];

        const isValid = validMimeTypes.includes(file.type) || validExtensions.includes(extension);

        if (!isValid) {
            toast.error(`Invalid file: ${extension}. Supported: PNG, JPG, DICOM, NII`);
            console.warn('[Upload] Invalid file type:', file.type, 'Extension:', extension);
            return;
        }

        console.log('[Upload] File accepted:', file.name, 'Type:', file.type, 'Size:', file.size);
        onFileSelect(file);

        // Preview for image files
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.onerror = () => {
                console.warn('[Upload] Preview failed for:', file.name);
                setPreview(null);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }

        resetAnalysis();
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
        setPreview(null);
        resetAnalysis();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card
            className={cn(
                "relative flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all h-[300px]",
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                selectedFile ? "border-solid border-border bg-card/50" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".png,.jpg,.jpeg,.dcm,.nii"
                onChange={(e) => {
                    if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
            />

            {selectedFile ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    {preview ? (
                        <div className="relative w-full h-full max-h-[220px] rounded-lg overflow-hidden border border-border">
                            <img src={preview} alt="Upload preview" className="w-full h-full object-contain bg-black/50" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileImage className="w-10 h-10 text-primary" />
                        </div>
                    )}

                    <div className="text-center">
                        <p className="font-medium text-sm truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>

                    <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                        onClick={handleRemove}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="text-center space-y-4 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto border shadow-sm">
                        <Upload className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Upload Images</h3>
                        <p className="text-sm text-muted-foreground">DICOM, PNG, JPG, NII supported</p>
                    </div>
                    <p className="text-xs text-muted-foreground pt-4">Drag & drop or click to browse</p>
                </div>
            )}
        </Card>
    );
}
