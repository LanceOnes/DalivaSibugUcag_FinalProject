import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus } from 'lucide-react'
import { acceptedImageTypes } from '@/lib/siteConfig'
import { cn } from '@/lib/utils'
import RemoveButton from '@/components/ui/removebutton'

interface UploadInputProps {
    label: string
    name: string
    value?: File | null
    onChange?: (file: File | null) => void
    onRemoveExistingImageUrl?: () => void
    existingImageUrl?: string | null
    errors?: string[]
    removeLabel?: string
    previewAlt?: string
    hint?: string
}

export default function UploadInput({
    label,
    name,
    value,
    onChange,
    onRemoveExistingImageUrl,
    existingImageUrl,
    errors,
    removeLabel = 'Remove photo',
    previewAlt = 'Upload preview',
    hint = 'PNG or JPG, up to 2MB',
}: UploadInputProps) {
    const [preview, setPreview] = useState<string | null>(null)

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0]
            if (!file) return
            onChange?.(file)
        },
        [onChange],
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedImageTypes,
        multiple: false,
        maxSize: 2 * 1024 * 1024,
    })

    useEffect(() => {
        let objectUrl: string | null = null

        if (value) {
            objectUrl = URL.createObjectURL(value)
            setPreview(objectUrl)
        } else if (existingImageUrl) {
            setPreview(existingImageUrl)
        } else {
            setPreview(null)
        }

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [value, existingImageUrl])

    const hasError = Boolean(errors?.length)

    return (
        <div className="space-y-2">
            <label htmlFor={name} className="text-sm font-medium text-belly-brown">
                {label}
            </label>

            <div
                {...getRootProps()}
                className={cn(
                    'cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors',
                    isDragActive
                        ? 'border-belly-gold bg-belly-gold/10'
                        : 'border-belly-brown/15 bg-belly-cream/40 hover:border-belly-gold/50',
                    hasError && 'border-red-400',
                )}
            >
                <input {...getInputProps()} name={name} id={name} />
                <div className="flex min-h-[180px] flex-col items-center justify-center p-6">
                    {preview ? (
                        <img
                            src={preview}
                            alt={previewAlt}
                            className="max-h-48 w-full rounded-lg object-contain"
                        />
                    ) : (
                        <>
                            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-belly-gold/15 text-belly-gold">
                                <ImagePlus className="h-7 w-7" />
                            </div>
                            <p className="text-center text-sm font-medium text-belly-brown">
                                {isDragActive ? 'Drop it here' : 'Drag a photo here'}
                            </p>
                            <p className="mt-1 text-center text-xs text-belly-brown/55">{hint}</p>
                            <p className="mt-2 text-xs font-medium text-belly-red underline">or browse files</p>
                        </>
                    )}
                </div>
            </div>

            {hasError && <p className="text-xs text-red-600">{errors![0]}</p>}

            {preview && (
                <RemoveButton
                    label={removeLabel}
                    onRemove={() => {
                        onChange?.(null)
                        onRemoveExistingImageUrl?.()
                        setPreview(null)
                    }}
                />
            )}
        </div>
    )
}
