"use client";

import { ChevronDown, ChevronRight, Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
}

interface CategoriesFormProps {
  categories: Category[];
  isExpanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string) => void;
}

export function CategoriesForm({
  categories,
  isExpanded,
  onToggle,
  onAdd,
  onRemove,
  onUpdate,
}: CategoriesFormProps) {
  return (
    <Card
      className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl
            dark:shadow-2xl"
    >
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>Position Categories</span>
          </CardTitle>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-400">
              Add position categories for your election
            </p>
            <Button
              onClick={onAdd}
              className="neumorphic-button bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="space-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center space-x-3 p-4 glass-panel rounded-lg"
              >
                <Input
                  className="bg-background/50 flex-1"
                  placeholder="Category name (e.g., President, Treasurer)"
                  value={category.name}
                  onChange={(e) => onUpdate(category.id, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(category.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories added yet. Click &#34;Add Category&#34; to get
              started.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
