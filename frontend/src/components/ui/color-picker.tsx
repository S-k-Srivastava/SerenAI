import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, className, label }) => {
    // Derived state
    const color = value && value.startsWith('#') ? value.substring(0, 7) : '#000000';
    let alpha = 100;
    if (value && value.startsWith('#') && value.length === 9) {
        const alphaHex = value.substring(7, 9);
        alpha = Math.round((parseInt(alphaHex, 16) / 255) * 100);
    }

    const handleColorChange = (newColor: string) => {
        // Enforce basic hex format for the input update
        // If coming from <input type="color">, it's always #RRGGBB
        if (alpha === 100) {
            onChange(newColor);
        } else {
            const alphaHex = Math.round((alpha / 100) * 255).toString(16).padStart(2, '0');
            onChange(`${newColor}${alphaHex}`);
        }
    };

    const handleAlphaChange = (newAlpha: number) => {
        if (newAlpha === 100) {
            onChange(color);
        } else {
            const alphaHex = Math.round((newAlpha / 100) * 255).toString(16).padStart(2, '0');
            onChange(`${color}${alphaHex}`);
        }
    };

    return (
        <div className={cn("space-y-1.5", className)}>
            {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal px-2 h-9 border-muted-foreground/20 hover:bg-muted/50">
                        <div className="w-5 h-5 rounded-md mr-2 border shadow-sm relative overflow-hidden bg-checkerboard">
                             <div 
                                className="absolute inset-0"
                                style={{ backgroundColor: value }}
                             />
                        </div>
                        <span className="flex-1 text-xs font-mono truncate uppercase">{value}</span>
                        <div className="text-[10px] text-muted-foreground pr-1 opacity-50">
                            {alpha}%
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 space-y-3">
                    <div className="space-y-1">
                        <Label className="text-xs font-medium">Color</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="w-10 h-8 p-0.5 cursor-pointer shrink-0"
                            />
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="flex-1 h-8 text-xs font-mono uppercase"
                                placeholder="#000000"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                             <Label className="text-xs font-medium">Opacity</Label>
                             <span className="text-xs text-muted-foreground font-mono">{alpha}%</span>
                        </div>
                        <Slider
                            value={[alpha]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(vals) => handleAlphaChange(vals[0])}
                            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
