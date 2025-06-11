"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Download,
  FileImage,
  Plus,
  Minus,
  Layout,
  LayoutGrid,
  Map,
  Filter,
  Upload,
  FileText,
  Expand,
  FileArchiveIcon as Compress,
  AlignCenterIcon as Center,
} from "lucide-react"

interface ToolbarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  departments: string[]
  locations: string[]
  designations: string[]
  selectedDepartment: string
  selectedLocation: string
  selectedDesignation: string
  onDepartmentChange: (dept: string) => void
  onLocationChange: (loc: string) => void
  onDesignationChange: (des: string) => void
  scale: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onFitToScreen: () => void
  layout: "vertical" | "horizontal"
  onLayoutChange: (layout: "vertical" | "horizontal") => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onExportPDF: () => void
  onExportImage: () => void
  onAddNode: () => void
  onRemoveNode: () => void
  onToggleFullscreen: () => void
  showMiniMap: boolean
  onToggleMiniMap: () => void
  onLoadData: (type: "json" | "csv") => void
  totalNodes: number
  visibleNodes: number
}

export default function Toolbar({
  searchTerm,
  onSearchChange,
  departments,
  locations,
  designations,
  selectedDepartment,
  selectedLocation,
  selectedDesignation,
  onDepartmentChange,
  onLocationChange,
  onDesignationChange,
  scale,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitToScreen,
  layout,
  onLayoutChange,
  onExpandAll,
  onCollapseAll,
  onExportPDF,
  onExportImage,
  onAddNode,
  onRemoveNode,
  onToggleFullscreen,
  showMiniMap,
  onToggleMiniMap,
  onLoadData,
  totalNodes,
  visibleNodes,
}: ToolbarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDesignation} onValueChange={onDesignationChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Designation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Designations</SelectItem>
              {designations.map((des) => (
                <SelectItem key={des} value={des}>
                  {des}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Data Loading */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onLoadData("json")}>
            <Upload className="h-4 w-4 mr-1" />
            JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => onLoadData("csv")}>
            <FileText className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onResetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onFitToScreen}>
            <Center className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="text-xs">
            {Math.round(scale * 100)}%
          </Badge>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Layout Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={layout === "vertical" ? "default" : "outline"}
            size="sm"
            onClick={() => onLayoutChange("vertical")}
          >
            <Layout className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "horizontal" ? "default" : "outline"}
            size="sm"
            onClick={() => onLayoutChange("horizontal")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Expand/Collapse */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExpandAll}>
            <Expand className="h-4 w-4 mr-1" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={onCollapseAll}>
            <Compress className="h-4 w-4 mr-1" />
            Collapse All
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Node Management */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddNode}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onRemoveNode}>
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Export */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-1" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={onExportImage}>
            <FileImage className="h-4 w-4 mr-1" />
            Image
          </Button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

        {/* View Options */}
        <div className="flex items-center gap-2">
          <Button variant={showMiniMap ? "default" : "outline"} size="sm" onClick={onToggleMiniMap}>
            <Map className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
            <Maximize className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">
            {visibleNodes} / {totalNodes} nodes
          </Badge>
        </div>
      </div>
    </div>
  )
}
