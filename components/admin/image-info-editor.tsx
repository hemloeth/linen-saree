"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, X, ImageIcon } from "lucide-react"
import type { ImageInfo } from "@/context/product-context"

interface ImageInfoEditorProps {
    imageInfo: ImageInfo
    imageIndex: number
    onChange: (updated: ImageInfo) => void
    onClose: () => void
}

export function ImageInfoEditor({ imageInfo, imageIndex, onChange, onClose }: ImageInfoEditorProps) {
    const [copied, setCopied] = useState(false)
    const [tagInput, setTagInput] = useState("")

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(imageInfo.url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // fallback
            const textarea = document.createElement("textarea")
            textarea.value = imageInfo.url
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand("copy")
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            const tag = tagInput.trim()
            const existingTags = imageInfo.tags || []
            if (tag && !existingTags.includes(tag)) {
                onChange({ ...imageInfo, tags: [...existingTags, tag] })
            }
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const existingTags = imageInfo.tags || []
        onChange({ ...imageInfo, tags: existingTags.filter(t => t !== tagToRemove) })
    }

    return (
        <div className="bg-card border rounded-xl p-5 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <ImageIcon className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                        Image {imageIndex + 1} Details
                    </h4>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Thumbnail preview */}
            <div className="flex items-start gap-4">
                <div className="w-16 h-20 rounded-lg overflow-hidden border shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageInfo.url} alt="Selected" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Image URL</Label>
                    <div className="flex gap-1.5">
                        <Input
                            value={imageInfo.url}
                            readOnly
                            className="h-8 text-xs bg-muted/50 text-muted-foreground cursor-default font-mono truncate"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handleCopyUrl}
                        >
                            {copied ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Title & Alt Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                    <Label htmlFor={`img-title-${imageIndex}`} className="text-[10px] uppercase text-muted-foreground font-bold">
                        Title
                    </Label>
                    <Input
                        id={`img-title-${imageIndex}`}
                        value={imageInfo.title}
                        onChange={(e) => onChange({ ...imageInfo, title: e.target.value })}
                        placeholder="Image title"
                        className="h-8 text-xs"
                    />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor={`img-alt-${imageIndex}`} className="text-[10px] uppercase text-muted-foreground font-bold">
                        Alt Text
                    </Label>
                    <Input
                        id={`img-alt-${imageIndex}`}
                        value={imageInfo.alt}
                        onChange={(e) => onChange({ ...imageInfo, alt: e.target.value })}
                        placeholder="Descriptive alt text for accessibility"
                        className="h-8 text-xs"
                    />
                </div>
            </div>

            {/* Description */}
            <div className="grid gap-1.5">
                <Label htmlFor={`img-desc-${imageIndex}`} className="text-[10px] uppercase text-muted-foreground font-bold">
                    Description
                </Label>
                <textarea
                    id={`img-desc-${imageIndex}`}
                    value={imageInfo.description}
                    onChange={(e) => onChange({ ...imageInfo, description: e.target.value })}
                    placeholder="Brief description of this image"
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
            </div>

            {/* Tags */}
            <div className="grid gap-1.5">
                <Label htmlFor={`img-tags-${imageIndex}`} className="text-[10px] uppercase text-muted-foreground font-bold">
                    Tags
                </Label>
                <Input
                    id={`img-tags-${imageIndex}`}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type a tag and press Enter"
                    className="h-8 text-xs"
                />
                {(imageInfo.tags && imageInfo.tags.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {imageInfo.tags.map((tag: string, i: number) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="text-[10px] py-0 h-5 pl-2 pr-1 gap-1 font-medium"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
