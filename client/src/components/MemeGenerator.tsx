import { useState, useRef, useEffect, useCallback } from "react";
import EmojiPicker, { Theme, EmojiClickData } from "emoji-picker-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Download,
  Type,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
  Smile,
  Palette,
  Undo2,
  Redo2,
  Layers,
} from "lucide-react";
import { SiX } from "react-icons/si";

const NORMIE_STICKERS = [
  { id: "pepe-classic", name: "Classic Pepe", emoji: "P", color: "#22c55e" },
  { id: "pepe-smug", name: "Smug Pepe", emoji: "S", color: "#16a34a" },
  { id: "pepe-angry", name: "Angry Pepe", emoji: "A", color: "#dc2626" },
  { id: "pepe-cry", name: "Crying Pepe", emoji: "C", color: "#3b82f6" },
  { id: "pepe-laugh", name: "Laughing Pepe", emoji: "L", color: "#eab308" },
  { id: "wojak-sad", name: "Sad Wojak", emoji: "W", color: "#6b7280" },
  { id: "wojak-npc", name: "NPC Wojak", emoji: "N", color: "#9ca3af" },
  { id: "wojak-doomer", name: "Doomer", emoji: "D", color: "#374151" },
  { id: "wojak-bloomer", name: "Bloomer", emoji: "B", color: "#f472b6" },
  { id: "chad", name: "Chad", emoji: "CH", color: "#06b6d4" },
  { id: "troll-face", name: "Troll Face", emoji: "T", color: "#f5f5f5" },
  { id: "doge", name: "Doge", emoji: "DG", color: "#f59e0b" },
];

const CRYPTO_STICKERS = [
  { id: "bitcoin", name: "Bitcoin", emoji: "BTC", color: "#f7931a" },
  { id: "ethereum", name: "Ethereum", emoji: "ETH", color: "#627eea" },
  { id: "solana", name: "Solana", emoji: "SOL", color: "#9945ff" },
  { id: "diamond-hands", name: "Diamond Hands", emoji: "DH", color: "#3b82f6" },
  { id: "paper-hands", name: "Paper Hands", emoji: "PH", color: "#9ca3af" },
  { id: "moon", name: "Moon", emoji: "M", color: "#fbbf24" },
  { id: "rocket", name: "Rocket", emoji: "R", color: "#ef4444" },
  { id: "whale", name: "Whale", emoji: "WH", color: "#0ea5e9" },
  { id: "chart-up", name: "Chart Up", emoji: "UP", color: "#22c55e" },
  { id: "chart-down", name: "Chart Down", emoji: "DN", color: "#ef4444" },
  { id: "hodl", name: "HODL", emoji: "HD", color: "#8b5cf6" },
  { id: "burn", name: "Token Burn", emoji: "BR", color: "#f97316" },
];

const BRAND_STICKERS = [
  { id: "normie-logo", name: "Normie Logo", emoji: "NM", color: "#22c55e" },
  { id: "normie-nation", name: "Normie Nation", emoji: "NN", color: "#16a34a" },
  { id: "based", name: "BASED", emoji: "BA", color: "#8b5cf6" },
  { id: "ngmi", name: "NGMI", emoji: "NG", color: "#ef4444" },
  { id: "wagmi", name: "WAGMI", emoji: "WG", color: "#22c55e" },
  { id: "verified", name: "Verified", emoji: "V", color: "#3b82f6" },
  { id: "4chan-clover", name: "4chan Clover", emoji: "4C", color: "#22c55e" },
  { id: "supply-burn", name: "Supply Burn", emoji: "SB", color: "#f97316" },
  { id: "locked", name: "Locked", emoji: "LK", color: "#eab308" },
  { id: "gm", name: "GM", emoji: "GM", color: "#fbbf24" },
];

const COLOR_PRESETS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "4chan Green", hex: "#00FF00" },
  { name: "Dark Gray", hex: "#1a1a1a" },
  { name: "Charcoal", hex: "#2c2c2c" },
  { name: "Navy", hex: "#001f3f" },
  { name: "Electric Blue", hex: "#0074D9" },
  { name: "Neon Pink", hex: "#FF1493" },
  { name: "Cyber Purple", hex: "#9B59B6" },
  { name: "Matrix Green", hex: "#00FF41" },
  { name: "Sunset Orange", hex: "#FF4500" },
  { name: "Laser Red", hex: "#FF0000" },
  { name: "Soft Pink", hex: "#FFB6C1" },
  { name: "Mint", hex: "#98FF98" },
  { name: "Lavender", hex: "#E6E6FA" },
  { name: "Peach", hex: "#FFDAB9" },
];

const GRADIENT_PRESETS = [
  { name: "Sunset", colors: ["#FF512F", "#DD2476"] },
  { name: "Ocean", colors: ["#2E3192", "#1BFFFF"] },
  { name: "Cyberpunk", colors: ["#8E2DE2", "#4A00E0"] },
  { name: "Vaporwave", colors: ["#FF6FD8", "#3813C2"] },
  { name: "Matrix", colors: ["#0f2618", "#1a1a1a"] },
  { name: "Fire", colors: ["#f12711", "#f5af19"] },
  { name: "Midnight", colors: ["#232526", "#414345"] },
  { name: "Emerald", colors: ["#134E5E", "#71B280"] },
];

const FONT_OPTIONS = [
  { name: "Impact", value: "Impact" },
  { name: "Arial Black", value: "Arial Black" },
  { name: "Comic Sans MS", value: "Comic Sans MS" },
  { name: "Courier New", value: "Courier New" },
  { name: "JetBrains Mono", value: "JetBrains Mono" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Roboto Mono", value: "Roboto Mono" },
  { name: "Space Mono", value: "Space Mono" },
];

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  font: string;
  strokeEnabled: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
}

interface StickerElement {
  id: string;
  type: "sticker" | "emoji";
  content: string;
  color?: string;
  x: number;
  y: number;
  scale: number;
}

interface CanvasState {
  textElements: TextElement[];
  stickerElements: StickerElement[];
  backgroundColor: string;
  gradientColors: string[] | null;
}

export function MemeGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  const [gradientColors, setGradientColors] = useState<string[] | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
  const [newText, setNewText] = useState("");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontSize, setFontSize] = useState([40]);
  const [selectedFont, setSelectedFont] = useState("Impact");
  const [strokeEnabled, setStrokeEnabled] = useState(true);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState([3]);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState([5]);
  const [emojiSize, setEmojiSize] = useState([60]);
  const [stickerSize, setStickerSize] = useState([1.5]);
  const [draggedElement, setDraggedElement] = useState<{ type: "text" | "sticker"; id: string } | null>(null);
  const [stickerCategory, setStickerCategory] = useState<"normie" | "crypto" | "brand">("normie");
  const [bgMode, setBgMode] = useState<"solid" | "gradient">("solid");
  
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    const state: CanvasState = {
      textElements: [...textElements],
      stickerElements: [...stickerElements],
      backgroundColor,
      gradientColors,
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [textElements, stickerElements, backgroundColor, gradientColors, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setTextElements(prevState.textElements);
      setStickerElements(prevState.stickerElements);
      setBackgroundColor(prevState.backgroundColor);
      setGradientColors(prevState.gradientColors);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setTextElements(nextState.textElements);
      setStickerElements(nextState.stickerElements);
      setBackgroundColor(nextState.backgroundColor);
      setGradientColors(nextState.gradientColors);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage) {
      const scale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
      const x = (canvas.width - backgroundImage.width * scale) / 2;
      const y = (canvas.height - backgroundImage.height * scale) / 2;
      ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale);
    } else if (gradientColors) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(1, gradientColors[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "rgba(34, 197, 94, 0.05)";
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    stickerElements.forEach((sticker) => {
      ctx.save();
      ctx.translate(sticker.x, sticker.y);
      ctx.scale(sticker.scale, sticker.scale);
      
      if (sticker.type === "emoji") {
        ctx.font = "48px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sticker.content, 0, 0);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fillStyle = sticker.color || "#22c55e";
        ctx.fill();
        
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px JetBrains Mono";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sticker.content.substring(0, 2), 0, 0);
      }
      
      ctx.restore();
    });

    textElements.forEach((text) => {
      ctx.save();
      ctx.font = `bold ${text.fontSize}px ${text.font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      if (text.shadowEnabled) {
        ctx.shadowColor = text.shadowColor;
        ctx.shadowBlur = text.shadowBlur;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      }
      
      if (text.strokeEnabled) {
        ctx.strokeStyle = text.strokeColor;
        ctx.lineWidth = text.strokeWidth;
        ctx.strokeText(text.text, text.x, text.y);
      }
      
      ctx.fillStyle = text.color;
      ctx.fillText(text.text, text.x, text.y);
      ctx.restore();
    });

    ctx.font = "bold 12px JetBrains Mono";
    ctx.fillStyle = "rgba(34, 197, 94, 0.4)";
    ctx.textAlign = "right";
    ctx.fillText("$NORMIE", canvas.width - 10, canvas.height - 10);
  }, [backgroundImage, backgroundColor, gradientColors, textElements, stickerElements]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBackgroundImage(img);
          setGradientColors(null);
          saveToHistory();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    if (!newText.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setTextElements([
      ...textElements,
      {
        id: `text-${Date.now()}`,
        text: newText,
        x: canvas.width / 2,
        y: canvas.height / 2,
        fontSize: fontSize[0],
        color: textColor,
        font: selectedFont,
        strokeEnabled,
        strokeColor,
        strokeWidth: strokeWidth[0],
        shadowEnabled,
        shadowColor,
        shadowBlur: shadowBlur[0],
      },
    ]);
    setNewText("");
    saveToHistory();
  };

  const addEmoji = (emojiData: EmojiClickData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStickerElements([
      ...stickerElements,
      {
        id: `emoji-${Date.now()}`,
        type: "emoji",
        content: emojiData.emoji,
        x: canvas.width / 2,
        y: canvas.height / 2,
        scale: emojiSize[0] / 48,
      },
    ]);
    saveToHistory();
  };

  const addSticker = (sticker: { id: string; emoji: string; color: string }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setStickerElements([
      ...stickerElements,
      {
        id: `sticker-${Date.now()}`,
        type: "sticker",
        content: sticker.emoji,
        color: sticker.color,
        x: canvas.width / 2,
        y: canvas.height / 2,
        scale: stickerSize[0],
      },
    ]);
    saveToHistory();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const sticker of stickerElements) {
      const dist = Math.sqrt((x - sticker.x) ** 2 + (y - sticker.y) ** 2);
      if (dist < 30 * sticker.scale) {
        setDraggedElement({ type: "sticker", id: sticker.id });
        return;
      }
    }

    for (const text of textElements) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = `bold ${text.fontSize}px ${text.font}`;
        const metrics = ctx.measureText(text.text);
        const width = metrics.width;
        const height = text.fontSize;
        
        if (
          x >= text.x - width / 2 &&
          x <= text.x + width / 2 &&
          y >= text.y - height / 2 &&
          y <= text.y + height / 2
        ) {
          setDraggedElement({ type: "text", id: text.id });
          return;
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (draggedElement.type === "text") {
      setTextElements(
        textElements.map((t) =>
          t.id === draggedElement.id ? { ...t, x, y } : t
        )
      );
    } else {
      setStickerElements(
        stickerElements.map((s) =>
          s.id === draggedElement.id ? { ...s, x, y } : s
        )
      );
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggedElement) {
      saveToHistory();
    }
    setDraggedElement(null);
  };

  const clearCanvas = () => {
    setTextElements([]);
    setStickerElements([]);
    setBackgroundImage(null);
    setGradientColors(null);
    setBackgroundColor("#1a1a1a");
    saveToHistory();
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `normie-meme-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const shareToX = () => {
    const text = encodeURIComponent(
      "Check out my $NORMIE meme! Normies unite! @NormieCEO #NORMIE #Solana"
    );
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
  };

  const getStickersByCategory = () => {
    switch (stickerCategory) {
      case "crypto": return CRYPTO_STICKERS;
      case "brand": return BRAND_STICKERS;
      default: return NORMIE_STICKERS;
    }
  };

  return (
    <section id="meme-generator" className="py-8 lg:py-12 px-4 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl lg:text-3xl font-mono font-bold uppercase tracking-tight">
            MEME GENERATOR
          </h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Create chaos. Fuel the raids. Share the vibes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Card className="p-4 overflow-hidden">
              <div className="relative aspect-square bg-background rounded-md overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full h-full cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  data-testid="canvas-meme"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    data-testid="button-undo"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    data-testid="button-redo"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCanvas}
                    data-testid="button-clear-canvas"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToX}
                    data-testid="button-share-x"
                  >
                    <SiX className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    onClick={downloadMeme}
                    data-testid="button-download-meme"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-4">
              <Tabs defaultValue="emoji">
                <TabsList className="w-full mb-4 grid grid-cols-4">
                  <TabsTrigger value="emoji" data-testid="tab-emoji">
                    <Smile className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="stickers" data-testid="tab-stickers">
                    <Layers className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="text" data-testid="tab-text">
                    <Type className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="background" data-testid="tab-background">
                    <Palette className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="emoji" className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Emoji Size: {emojiSize[0]}px
                    </Label>
                    <Slider
                      value={emojiSize}
                      onValueChange={setEmojiSize}
                      min={24}
                      max={120}
                      step={4}
                      data-testid="slider-emoji-size"
                    />
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <EmojiPicker
                      onEmojiClick={addEmoji}
                      theme={Theme.DARK}
                      width="100%"
                      height={300}
                      searchPlaceholder="Search emoji..."
                      previewConfig={{ showPreview: false }}
                      lazyLoadEmojis
                    />
                  </div>
                </TabsContent>

                <TabsContent value="stickers" className="space-y-4">
                  <div className="flex gap-2 mb-3">
                    <Button
                      variant={stickerCategory === "normie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStickerCategory("normie")}
                      data-testid="button-category-normie"
                    >
                      Normie
                    </Button>
                    <Button
                      variant={stickerCategory === "crypto" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStickerCategory("crypto")}
                      data-testid="button-category-crypto"
                    >
                      Crypto
                    </Button>
                    <Button
                      variant={stickerCategory === "brand" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStickerCategory("brand")}
                      data-testid="button-category-brand"
                    >
                      Brand
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Sticker Size: {stickerSize[0].toFixed(1)}x
                    </Label>
                    <Slider
                      value={stickerSize}
                      onValueChange={setStickerSize}
                      min={0.5}
                      max={3}
                      step={0.1}
                      data-testid="slider-sticker-size"
                    />
                  </div>
                  <ScrollArea className="h-[260px]">
                    <div className="grid grid-cols-4 gap-2">
                      {getStickersByCategory().map((sticker) => (
                        <Button
                          key={sticker.id}
                          variant="outline"
                          className="aspect-square p-2 flex flex-col items-center justify-center"
                          onClick={() => addSticker(sticker)}
                          data-testid={`button-sticker-${sticker.id}`}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: sticker.color }}
                          >
                            {sticker.emoji}
                          </div>
                          <span className="text-[9px] mt-1 truncate w-full text-center">
                            {sticker.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <ScrollArea className="h-[340px] pr-3">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter meme text..."
                          value={newText}
                          onChange={(e) => setNewText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addText()}
                          className="font-mono"
                          data-testid="input-meme-text"
                        />
                        <Button onClick={addText} data-testid="button-add-text">
                          Add
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                          Font
                        </Label>
                        <Select value={selectedFont} onValueChange={setSelectedFont}>
                          <SelectTrigger data-testid="select-font">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                <span style={{ fontFamily: font.value }}>{font.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                          Font Size: {fontSize[0]}px
                        </Label>
                        <Slider
                          value={fontSize}
                          onValueChange={setFontSize}
                          min={16}
                          max={80}
                          step={2}
                          data-testid="slider-font-size"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                          Text Color
                        </Label>
                        <div className="flex flex-wrap items-center gap-1">
                          {["#FFFFFF", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"].map(
                            (color) => (
                              <button
                                key={color}
                                className={`w-7 h-7 rounded-md border-2 transition-all ${
                                  textColor === color
                                    ? "border-foreground scale-110"
                                    : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setTextColor(color)}
                                data-testid={`button-text-color-${color}`}
                              />
                            )
                          )}
                          <Input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-8 h-7 p-0 border-0 cursor-pointer"
                            data-testid="input-text-color-picker"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 p-3 border rounded-md">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs font-mono">Stroke/Outline</Label>
                          <Switch
                            checked={strokeEnabled}
                            onCheckedChange={setStrokeEnabled}
                            data-testid="switch-stroke"
                          />
                        </div>
                        {strokeEnabled && (
                          <>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-mono w-16">Color</Label>
                              <Input
                                type="color"
                                value={strokeColor}
                                onChange={(e) => setStrokeColor(e.target.value)}
                                className="w-10 h-7 p-0 border-0 cursor-pointer"
                                data-testid="input-stroke-color"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-mono">Width: {strokeWidth[0]}px</Label>
                              <Slider
                                value={strokeWidth}
                                onValueChange={setStrokeWidth}
                                min={1}
                                max={10}
                                step={1}
                                data-testid="slider-stroke-width"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-3 p-3 border rounded-md">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs font-mono">Shadow</Label>
                          <Switch
                            checked={shadowEnabled}
                            onCheckedChange={setShadowEnabled}
                            data-testid="switch-shadow"
                          />
                        </div>
                        {shadowEnabled && (
                          <>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs font-mono w-16">Color</Label>
                              <Input
                                type="color"
                                value={shadowColor}
                                onChange={(e) => setShadowColor(e.target.value)}
                                className="w-10 h-7 p-0 border-0 cursor-pointer"
                                data-testid="input-shadow-color"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-mono">Blur: {shadowBlur[0]}px</Label>
                              <Slider
                                value={shadowBlur}
                                onValueChange={setShadowBlur}
                                min={0}
                                max={20}
                                step={1}
                                data-testid="slider-shadow-blur"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {textElements.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Added Text
                          </Label>
                          <div className="space-y-1">
                            {textElements.map((text) => (
                              <div
                                key={text.id}
                                className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md"
                              >
                                <span
                                  className="text-sm font-mono truncate"
                                  style={{ color: text.color }}
                                >
                                  {text.text}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setTextElements(textElements.filter((t) => t.id !== text.id))
                                  }
                                  data-testid={`button-delete-text-${text.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="background" className="space-y-4">
                  <ScrollArea className="h-[340px] pr-3">
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        data-testid="input-image-upload"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-upload-image"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant={bgMode === "solid" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setBgMode("solid")}
                          data-testid="button-bg-solid"
                        >
                          Solid
                        </Button>
                        <Button
                          variant={bgMode === "gradient" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setBgMode("gradient")}
                          data-testid="button-bg-gradient"
                        >
                          Gradient
                        </Button>
                      </div>

                      {bgMode === "solid" ? (
                        <div className="space-y-2">
                          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Solid Colors
                          </Label>
                          <div className="grid grid-cols-6 gap-2">
                            {COLOR_PRESETS.map((color) => (
                              <button
                                key={color.hex}
                                className={`w-full aspect-square rounded-md border-2 transition-all ${
                                  backgroundColor === color.hex && !gradientColors
                                    ? "border-foreground scale-105"
                                    : "border-transparent"
                                }`}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => {
                                  setBackgroundColor(color.hex);
                                  setGradientColors(null);
                                  setBackgroundImage(null);
                                  saveToHistory();
                                }}
                                title={color.name}
                                data-testid={`button-bg-color-${color.hex}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Label className="text-xs font-mono">Custom:</Label>
                            <Input
                              type="color"
                              value={backgroundColor}
                              onChange={(e) => {
                                setBackgroundColor(e.target.value);
                                setGradientColors(null);
                                setBackgroundImage(null);
                              }}
                              className="w-10 h-8 p-0 border-0 cursor-pointer"
                              data-testid="input-bg-color-picker"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Gradients
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {GRADIENT_PRESETS.map((gradient) => (
                              <button
                                key={gradient.name}
                                className={`h-12 rounded-md border-2 transition-all ${
                                  gradientColors?.join() === gradient.colors.join()
                                    ? "border-foreground scale-[1.02]"
                                    : "border-transparent"
                                }`}
                                style={{
                                  background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                                }}
                                onClick={() => {
                                  setGradientColors(gradient.colors);
                                  setBackgroundImage(null);
                                  saveToHistory();
                                }}
                                data-testid={`button-gradient-${gradient.name}`}
                              >
                                <span className="text-xs font-mono text-white drop-shadow-md">
                                  {gradient.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {stickerElements.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Added Elements ({stickerElements.length})
                          </Label>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {stickerElements.map((sticker) => (
                              <div
                                key={sticker.id}
                                className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md"
                              >
                                <span className="text-sm font-mono">
                                  {sticker.type === "emoji" ? sticker.content : sticker.content}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    setStickerElements(stickerElements.filter((s) => s.id !== sticker.id))
                                  }
                                  data-testid={`button-delete-sticker-${sticker.id}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
