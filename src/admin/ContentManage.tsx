import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ContentManage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">콘텐츠 관리</h2>
          <p className="text-slate-500">사용자들이 작성한 게시글을 모니터링합니다.</p>
        </div>
        <Button variant="outline">신고된 글만 보기</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="p-20 text-center text-slate-400">
            <FileText className="mx-auto mb-4 opacity-20" size={48} />
            <p>서버와 연동하면 게시글 목록이 여기에 표시됩니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManage;