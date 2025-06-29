"use client";

import * as React from "react";
import { useState } from "react";
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  Label,
  Pie,
  PieChart,
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Candidate } from "@/types/candidate";
import { Election } from "@/types/election";
import { cn } from "@/lib/utils";
import { Category } from "@/types/category";

interface ElectionChartProps {
  election: Election;
  selectedCategory?: string | Category;
  showCategoryTabs?: boolean;
  showChartTypeToggle?: boolean;
  defaultChartType?: "pie" | "bar";
  onCategoryChange?: (category: string) => void;
  resultsByCategory?: Record<string, Candidate[]>;
  customTabsClassName?: string;
}

const CHART_COLORS = [
  "hsl(238, 94%, 67%)",
  "hsl(262, 83%, 58%)",
  "hsl(221, 83%, 53%)",
  "hsl(271, 81%, 56%)",
  "hsl(250, 84%, 54%)",
  "hsl(235, 89%, 70%)",
  "hsl(270, 95%, 75%)",
  "hsl(213, 94%, 68%)",
  "hsl(260, 100%, 80%)",
  "hsl(245, 100%, 85%)",
];

const ElectionChart: React.FC<ElectionChartProps> = ({
  election,
  selectedCategory,
  showCategoryTabs = true,
  showChartTypeToggle = true,
  defaultChartType = "pie",
  onCategoryChange,
  resultsByCategory: propResultsByCategory,
  customTabsClassName,
}) => {
  const [chartType, setChartType] = useState<"pie" | "bar">(defaultChartType);
  const [activeCategory, setActiveCategory] = useState(
    selectedCategory || election.categories[0],
  );

  React.useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const resultsByCategory = React.useMemo(() => {
    if (propResultsByCategory) {
      return propResultsByCategory;
    }

    const results = (election?.candidates ?? []).reduce(
      (acc, candidate) => {
        if (!acc[candidate.category]) {
          acc[candidate.category] = [];
        }
        acc[candidate.category].push(candidate);
        return acc;
      },
      {} as Record<string, Candidate[]>,
    );

    Object.keys(results).forEach((category) => {
      results[category].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    });

    return results;
  }, [election?.candidates, propResultsByCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  const prepareChartData = (category: string) => {
    const candidates = resultsByCategory[category] || [];
    return candidates.map((candidate, index) => ({
      name: candidate.name,
      votes: candidate.voteCount || 0,
      fill: CHART_COLORS[index % CHART_COLORS.length],
      id: candidate.id,
      matricNumber: candidate.matricNo,
    }));
  };

  const createChartConfig = (category: string): ChartConfig => {
    const candidates = resultsByCategory[category] || [];
    const config: ChartConfig = {
      votes: {
        label: "Votes",
      },
    };

    candidates.forEach((candidate, index) => {
      config[candidate.id] = {
        label: candidate.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return config;
  };

  const chartData = prepareChartData(activeCategory as string);
  const chartConfig = createChartConfig(activeCategory as string);

  const totalVotes = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.votes, 0);
  }, [chartData]);

  const getWinnerInfo = (category: string) => {
    const candidates = resultsByCategory[category] || [];
    if (candidates.length === 0) return null;

    const winner = candidates[0];
    const totalCategoryVotes = candidates.reduce(
      (sum, c) => sum + (c.voteCount || 0),
      0,
    );
    const winnerPercentage =
      totalCategoryVotes > 0
        ? (((winner.voteCount || 0) / totalCategoryVotes) * 100).toFixed(1)
        : "0";

    return { winner, percentage: winnerPercentage };
  };

  const winnerInfo = getWinnerInfo(activeCategory as string);

  const renderChart = () => {
    if (chartType === "pie") {
      return (
        <Card className="flex flex-col bg-gray-50 dark:bg-gray-900">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg">
              {activeCategory as string} - Vote Distribution
            </CardTitle>
            <CardDescription>
              Election Results for {activeCategory as string}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[350px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="votes"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {totalVotes.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              Total Votes
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm items-center">
            {winnerInfo && (
              <>
                <div className="flex items-center gap-2 leading-none font-medium text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  {winnerInfo.winner.name} leads with {winnerInfo.percentage}%
                  of votes
                </div>
                <div className="text-muted-foreground leading-none text-center">
                  {totalVotes} total votes cast in {activeCategory as string}
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg">
            {activeCategory as string} - Vote Distribution
          </CardTitle>
          <CardDescription>
            Election Results for {activeCategory as string}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                maxBarSize={60}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => {
                    return value.length > 10
                      ? `${value.substring(0, 10)}...`
                      : value;
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="votes"
                  strokeWidth={2}
                  radius={8}
                  activeIndex={0}
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke={props.payload.fill}
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-center gap-2 text-sm">
          {winnerInfo && (
            <>
              <div className="flex gap-2 leading-none font-medium text-green-600">
                <TrendingUp className="h-4 w-4" />
                {winnerInfo.winner.name} leads with {winnerInfo.percentage}% of
                votes
              </div>
              <div className="text-muted-foreground leading-none">
                {totalVotes} total votes cast in {activeCategory as string}
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    );
  };

  if (!showCategoryTabs) {
    return (
      <div className="space-y-4">
        {showChartTypeToggle && (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant={chartType === "pie" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("pie")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <PieChartIcon className="w-4 h-4" />
              Pie Chart
            </Button>
            <Button
              variant={chartType === "bar" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("bar")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              Bar Chart
            </Button>
          </div>
        )}
        {renderChart()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={activeCategory as string}
        onValueChange={handleCategoryChange}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList
            className={cn("bg-gray-100 dark:bg-gray-800", customTabsClassName)}
          >
            {election.categories.map((category) => (
              <TabsTrigger
                key={category as unknown as string}
                value={category as unknown as string}
                className="font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:bg-gradient-to-tr from-[#254192] to-[#192E69]"
              >
                {category as unknown as string}
              </TabsTrigger>
            ))}
          </TabsList>

          {showChartTypeToggle && (
            <div className="flex items-center gap-2">
              <Button
                variant={chartType === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("pie")}
                className="flex items-center gap-2"
              >
                <PieChartIcon className="w-4 h-4" />
                Pie Chart
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Bar Chart
              </Button>
            </div>
          )}
        </div>

        {election.categories.map((category) => (
          <TabsContent
            key={category as unknown as string}
            value={category as unknown as string}
            className="space-y-4"
          >
            {renderChart()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ElectionChart;
