import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Star, Camera, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function QualityCheck() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  
  const pendingChecks = [
    {
      id: "TB-001",
      product: "Tomatoes",
      weight: "150kg",
      supplier: "Green Farm",
      receivedTime: "2 hours ago",
      priority: "High",
      temperature: "4°C"
    },
    {
      id: "SP-002", 
      product: "Spinach",
      weight: "80kg",
      supplier: "Organic Valley",
      receivedTime: "1 hour ago",
      priority: "Medium",
      temperature: "2°C"
    },
    {
      id: "ON-003",
      product: "Onions",
      weight: "200kg", 
      supplier: "Local Co-op",
      receivedTime: "30 minutes ago",
      priority: "Low",
      temperature: "Room Temp"
    }
  ];

  const qualityParameters = [
    { name: "Visual Appearance", weight: 25, score: null },
    { name: "Freshness", weight: 30, score: null },
    { name: "Size Consistency", weight: 15, score: null },
    { name: "Color", weight: 20, score: null },
    { name: "Texture", weight: 10, score: null }
  ];

  const [assessmentScores, setAssessmentScores] = useState<{[key: string]: number}>({});
  const [notes, setNotes] = useState("");

  const updateScore = (parameter: string, score: number) => {
    setAssessmentScores(prev => ({
      ...prev,
      [parameter]: score
    }));
  };

  const calculateOverallScore = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    qualityParameters.forEach(param => {
      const score = assessmentScores[param.name];
      if (score !== undefined) {
        totalWeightedScore += (score * param.weight);
        totalWeight += param.weight;
      }
    });

    return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-green-400";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  const getGradeFromScore = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      "High": "bg-red-500/10 text-red-500",
      "Medium": "bg-yellow-500/10 text-yellow-500", 
      "Low": "bg-green-500/10 text-green-500"
    };
    return colors[priority as keyof typeof colors];
  };

  const handleSubmitAssessment = () => {
    const overallScore = calculateOverallScore();
    const grade = getGradeFromScore(overallScore);
    
    console.log("Quality Assessment:", {
      batchId: selectedBatch,
      scores: assessmentScores,
      overallScore,
      grade,
      notes
    });
    
    // Reset form
    setSelectedBatch(null);
    setAssessmentScores({});
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {!selectedBatch ? (
        // Batch Selection View
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Quality Check Queue
            </CardTitle>
            <CardDescription>
              Select a batch for quality assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingChecks.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/70 cursor-pointer transition-colors"
                  onClick={() => setSelectedBatch(batch.id)}
                >
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="font-mono">
                      {batch.id}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{batch.product}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{batch.supplier}</span>
                        <span>{batch.weight}</span>
                        <span>{batch.receivedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(batch.priority)}>
                      {batch.priority}
                    </Badge>
                    <Badge variant="outline">
                      {batch.temperature}
                    </Badge>
                    <Button size="sm">Start Check</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Quality Assessment View
        <div className="space-y-6">
          {/* Batch Info Header */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Quality Assessment - {selectedBatch}
                  </CardTitle>
                  <CardDescription>
                    {pendingChecks.find(b => b.id === selectedBatch)?.product} - {pendingChecks.find(b => b.id === selectedBatch)?.weight}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedBatch(null)}>
                  Back to Queue
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Quality Parameters */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quality Parameters Assessment</CardTitle>
              <CardDescription>
                Rate each parameter from 1-10 (10 being excellent)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {qualityParameters.map((param) => (
                  <div key={param.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">
                        {param.name} ({param.weight}% weight)
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <Badge variant="outline">
                          {assessmentScores[param.name] || "Not rated"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <Button
                          key={score}
                          variant={assessmentScores[param.name] === score ? "default" : "outline"}
                          size="sm"
                          className="w-10 h-10 p-0"
                          onClick={() => updateScore(param.name, score)}
                        >
                          {score}
                        </Button>
                      ))}
                    </div>
                    <Progress 
                      value={assessmentScores[param.name] * 10 || 0} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Score Display */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Overall Quality Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-6xl font-bold ${getScoreColor(calculateOverallScore())}`}>
                  {calculateOverallScore()}
                </div>
                <div className="space-y-2">
                  <Badge className="text-lg px-4 py-2">
                    {getGradeFromScore(calculateOverallScore())}
                  </Badge>
                  <Progress value={calculateOverallScore()} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quality Notes & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Assessment Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add detailed quality observations, defects, or special notes..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
                  onClick={handleSubmitAssessment}
                  disabled={Object.keys(assessmentScores).length !== qualityParameters.length}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Assessment
                </Button>
                <Button variant="outline" className="flex-1">
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Assessments */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Quality Assessments</CardTitle>
          <CardDescription>Latest completed quality checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: "CA-004", product: "Carrots", score: 92, grade: "Excellent", time: "1 hour ago" },
              { id: "CB-005", product: "Cabbage", score: 85, grade: "Very Good", time: "2 hours ago" },
              { id: "PT-006", product: "Potatoes", score: 78, grade: "Good", time: "3 hours ago" }
            ].map((assessment, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="font-mono">
                    {assessment.id}
                  </Badge>
                  <div>
                    <p className="font-medium">{assessment.product}</p>
                    <p className="text-sm text-muted-foreground">{assessment.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(assessment.score)}`}>
                    {assessment.score}
                  </span>
                  <Badge className="bg-green-500/10 text-green-500">
                    {assessment.grade}
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