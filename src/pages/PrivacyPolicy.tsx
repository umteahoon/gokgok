import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Mail, Lock, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* 상단 네비게이션 */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="bg-white/50 backdrop-blur-sm">
            <ArrowLeft size={16} className="mr-2" />
            이전으로
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" />
            개인정보처리방침
          </h1>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-none overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white/50">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <CheckCircle className="text-green-500" size={20} />
              곡곡(GokGok) 개인정보처리방침
            </CardTitle>
            <p className="text-sm text-slate-500">최종 업데이트: 2026년 3월 27일</p>
          </CardHeader>

          <CardContent className="p-0">
            {/* TermsOfService와 동일하게 ScrollArea를 사용합니다. */}
            <ScrollArea className="h-[700px] p-8">
              <div className="space-y-10 text-slate-700 leading-relaxed text-sm">
                
                {/* 서문 */}
                <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400 flex gap-3 italic">
                  <Info className="text-blue-500 shrink-0" size={20} />
                  <p>
                    곡곡(GokGok)은 이용자의 개인정보를 소중하게 생각하며, 관련 법령을 준수하여 이용자의 권익 보호에 최선을 다하고 있습니다.
                  </p>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">1. 개인정보의 처리 목적</h3>
                    <p>서비스는 회원가입, 맞춤형 축제 정보 제공, 고객 상담 등을 위해 최소한의 개인정보를 처리합니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">2. 처리하는 개인정보 항목</h3>
                    <ul className="space-y-1 list-disc list-inside pl-2">
                      <li>필수항목: 이메일 주소, 비밀번호, 닉네임</li>
                      <li>자동수집항목: IP 주소, 쿠키, 서비스 이용 기록</li>
                    </ul>
                  </section>

                  <section className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                    <h3 className="text-base font-bold text-slate-900 mb-2">4. Google AdSense 및 쿠키 사용</h3>
                    <p>본 사이트는 Google AdSense 광고 서비스를 이용하며, 사용자의 방문 기록을 바탕으로 한 맞춤형 광고 제공을 위해 쿠키를 활용할 수 있습니다.</p>
                  </section>

                  <section className="bg-green-50/30 p-5 rounded-lg border border-green-100">
                    <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Mail size={18} className="text-green-600" />
                      5. 개인정보보호책임자
                    </h3>
                    <p>성명: ____________________</p>
                    <p>이메일: ____________________</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">7. 개인정보의 안전성 확보 조치</h3>
                    <div className="flex gap-4 items-start">
                      <Lock className="text-blue-500 shrink-0 mt-1" size={20} />
                      <p>회사는 개인정보 암호화, 접근 제한 시스템 운영 등 기술적/관리적 보안 대책을 통해 정보를 안전하게 보호하고 있습니다.</p>
                    </div>
                  </section>

                  <div className="pt-10 border-t border-slate-200 text-center text-gray-400">
                    <p>© 2026 곡곡(GokGok). All rights reserved.</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={() => navigate('/')} className="px-12 bg-blue-600 hover:bg-blue-700 shadow-md">
            개인정보 처리방침 확인 완료
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;