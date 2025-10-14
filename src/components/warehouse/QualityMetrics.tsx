import { Star, TrendingUp, AlertTriangle, CheckCircle, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

export function QualityMetrics() {
  const qualityTrends = [
    { week: "Week 1", score: 89, issues: 12, resolved: 11 },
    { week: "Week 2", score: 92, issues: 8, resolved: 8 },
    { week: "Week 3", score: 85, issues: 15, resolved: 13 },
    { week: "Week 4", score: 94, issues: 6, resolved: 6 },
    { week: "Week 5", score: 91, issues: 9, resolved: 9 },
    { week: "Week 6", score: 96, issues: 4, resolved: 4 },
    { week: "Week 7", score: 93, issues: 7, resolved: 7 },
    { week: "Week 8", score: 95, issues: 5, resolved: 5 }
  ];

  const categoryQuality = [
    { category: "Vegetables", score: 94, samples: 156, defects: 9, grade: "A" },
    { category: "Fruits", score: 91, samples: 89, defects: 8, grade: "A-" },
    { category: "Leafy Greens", score: 88, samples: 67, defects: 8, grade: "B+" },
    { category: "Herbs", score: 96, samples: 45, defects: 2, grade: "A+" }
  ];

  const recentQualityChecks = [
    {
      id: "TB-001",
      product: "Tomatoes",
      batch: "500kg",
      score: 92,
      grade: "Excellent",
      checker: "Priya Sharma",
      time: "2 hours ago",
      issues: []
    },
    {
      id: "SP-002", 
      product: "Spinach",
      batch: "200kg",
      score: 85,
      grade: "Very Good",
      checker: "Rajesh Kumar",
      time: "4 hours ago",
      issues: ["Minor wilting on 5% leaves"]
    },
    {
      id: "ON-003",
      product: "Onions",
      batch: "800kg",
      score: 78,
      grade: "Good",
      checker: "Amit Patel",
      time: "6 hours ago",
      issues: ["Size inconsistency", "Surface blemishes on 12%"]
    },
    {
      id: "CR-004",
      product: "Carrots",
      batch: "300kg",
      score: 96,
      grade: "Excellent",
      checker: "Sunita Reddy",
      time: "8 hours ago",
      issues: []
    }
  ];

  const qualityParameters = [
    { parameter: "Visual Appearance", current: 94, target: 90, weight: 25 },
    { parameter: "Freshness", current: 96, target: 95, weight: 30 },
    { parameter: "Size Consistency", current: 87, target: 85, weight: 15 },
    { parameter: "Color Quality", current: 92, target: 88, weight: 20 },
    { parameter: "Texture", current: 89, target: 85, weight: 10 }
  ];

  const supplierQuality = [
    { supplier: "Green Farm Co.", deliveries: 45, avgScore: 94, grade: "A", trend: "up" },
    { supplier: "Organic Valley", deliveries: 32, avgScore: 91, grade: "A-", trend: "stable" },
    { supplier: "Fresh Fields Ltd", deliveries: 28, avgScore: 87, grade: "B+", trend: "up" },
    { supplier: "Local Co-op", deliveries: 67, avgScore: 89, grade: "B+", trend: "down" },
    { supplier: "Premium Farms", deliveries: 18, avgScore: 96, grade: "A+", trend: "up" }
  ];

  const getGradeColor = (grade: string) => {
    const colors = {
      "A+": "bg-green-600/10 text-green-600",
      "A": "bg-green-500/10 text-green-500",
      "A-": "bg-green-400/10 text-green-400",
      "B+": "bg-yellow-500/10 text-yellow-500",
      "B": "bg-orange-500/10 text-orange-500",
      "B-": "bg-red-500/10 text-red-500"
    };
    return colors[grade as keyof typeof colors] || "bg-gray-500/10 text-gray-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-green-600";
    if (score >= 90) return "text-green-500";
    if (score >= 85) return "text-blue-500";
    if (score >= 80) return "text-yellow-500";
    return "text-red-500";
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-3 w-3 text-green-500" />;
    if (trend === "down") return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    return <div className="h-3 w-3 rounded-full bg-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Quality Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">95.2</p>
                <p className="text-sm text-muted-foreground">Avg Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-500">98.5%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">5</p>
                <p className="text-sm text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">357</p>
                <p className="text-sm text-muted-foreground">Checks Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quality Trends
          </CardTitle>
          <CardDescription>Weekly quality scores and issue resolution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="week" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                  name="Quality Score"
                />
                <Bar 
                  dataKey="issues" 
                  fill="hsl(var(--destructive))" 
                  name="Issues"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Quality Breakdown */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quality by Category</CardTitle>
            <CardDescription>Performance across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryQuality.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.category}</span>
                      <Badge className={getGradeColor(category.grade)}>
                        {category.grade}
                      </Badge>
                    </div>
                    <span className={`font-bold ${getScoreColor(category.score)}`}>
                      {category.score}
                    </span>
                  </div>
                  <Progress value={category.score} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{category.samples} samples tested</span>
                    <span>{category.defects} defects found</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quality Parameters */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quality Parameters</CardTitle>
            <CardDescription>Current vs target performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualityParameters.map((param, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{param.parameter}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(param.current)}`}>
                        {param.current}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (Target: {param.target}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={param.current} className="h-2 flex-1" />
                    <Badge variant="outline" className="text-xs">
                      {param.weight}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quality Checks */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Recent Quality Checks
          </CardTitle>
          <CardDescription>Latest quality assessment results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentQualityChecks.map((check) => (
              <div key={check.id} className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {check.id}
                    </Badge>
                    <div>
                      <h4 className="font-semibold">{check.product}</h4>
                      <p className="text-sm text-muted-foreground">{check.batch}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getScoreColor(check.score)}`}>
                      {check.score}
                    </span>
                    <Badge className={getGradeColor(check.grade)} >
                      {check.grade}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>Checked by: <strong>{check.checker}</strong></span>
                    <span className="text-muted-foreground">{check.time}</span>
                  </div>
                </div>

                {check.issues.length > 0 && (
                  <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-4 border-orange-500">
                    <p className="text-sm font-medium mb-1">Issues Found:</p>
                    <ul className="text-sm space-y-1">
                      {check.issues.map((issue, idx) => (
                        <li key={idx} className="text-orange-600 dark:text-orange-400">
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Quality Rating */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Supplier Quality Rating
          </CardTitle>
          <CardDescription>Quality performance by supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplierQuality.map((supplier, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="space-y-1">
                  <h4 className="font-medium">{supplier.supplier}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{supplier.deliveries} deliveries</span>
                    <div className="flex items-center gap-1">
                      <span>Trend:</span>
                      {getTrendIcon(supplier.trend)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`font-bold ${getScoreColor(supplier.avgScore)}`}>
                      {supplier.avgScore}%
                    </span>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <Badge className={getGradeColor(supplier.grade)}>
                    {supplier.grade}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}