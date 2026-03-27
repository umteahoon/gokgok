// 이용약관 추가 엄태훈 

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Info, Scale, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';


const TermsOfService = () => {
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
            <Scale className="text-blue-600" />
            이용약관
          </h1>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-none overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white/50">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <CheckCircle className="text-green-500" size={20} />
              곡곡(GokGok) 서비스 전체 이용약관
            </CardTitle>
            <p className="text-sm text-slate-500">시행일: 2026년 3월 27일</p>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[700px] p-8">
              <div className="space-y-10 text-slate-700 leading-relaxed text-sm">
                
                {/* 상단 안내 문구 */}
                <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-400 flex gap-3 italic">
                  <Info className="text-blue-500 shrink-0" size={20} />
                  <p>
                    본 약관은 곡곡(GokGok) 서비스를 이용함에 있어 이용자와 운영자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다. 서비스를 이용하시기 전 반드시 정독해 주시기 바랍니다.
                  </p>
                </div>

                <div className="space-y-8">
                  {/* 제1조 ~ 제5조 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제1조 (목적)</h3>
                    <p>본 이용약관은 “곡곡(GokGok)”(이하 "사이트")의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제2조 (용어의 정의)</h3>
                    <ul className="space-y-2 pl-2">
                      <li>① <strong>회원</strong> : 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 사이트와의 이용계약을 체결하고 사이트를 이용하는 이용자를 말합니다.</li>
                      <li>② <strong>이용계약</strong> : 사이트 이용과 관련하여 사이트와 회원간에 체결 하는 계약을 말합니다.</li>
                      <li>③ <strong>회원 아이디(ID)</strong> : 회원의 식별과 회원의 서비스 이용을 위하여 회원별로 부여하는 고유한 문자와 숫자의 조합을 말합니다.</li>
                      <li>④ <strong>비밀번호</strong> : 회원이 부여받은 ID와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.</li>
                      <li>⑤ <strong>운영자</strong> : 서비스에 홈페이지를 개설하여 운영하는 운영자를 말합니다.</li>
                      <li>⑥ <strong>해지</strong> : 회원이 이용계약을 해약하는 것을 말합니다.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제3조 (약관 외 준칙)</h3>
                    <p>운영자는 필요한 경우 별도로 운영정책을 공지 안내할 수 있으며, 본 약관과 운영정책이 중첩될 경우 운영정책이 우선 적용됩니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제4조 (이용계약 체결)</h3>
                    <p>① 이용계약은 회원으로 등록하여 사이트를 이용하려는 자의 본 약관 내용에 대한 동의와 가입신청에 대하여 운영자의 이용승낙으로 성립합니다.</p>
                    <p>② 회원으로 등록하여 서비스를 이용하려는 자는 사이트 가입신청 시 본 약관을 읽고 "동의합니다"를 선택하는 것으로 본 약관에 대한 동의 의사 표시를 합니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제5조 (서비스 이용 신청)</h3>
                    <p>① 회원으로 등록하여 사이트를 이용하려는 이용자는 사이트에서 요청하는 제반정보(이용자ID, 비밀번호, 닉네임 등)를 제공해야 합니다.</p>
                    <p>② 타인의 정보를 도용하거나 허위의 정보를 등록하는 등 본인의 진정한 정보를 등록하지 않은 회원은 사이트 이용과 관련하여 아무런 권리를 주장할 수 없으며, 관계 법령에 따라 처벌받을 수 있습니다.</p>
                  </section>

                  {/* 제6조 강조 */}
                  <section className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-2">제6조 (개인정보처리방침)</h3>
                    <p>사이트 및 운영자는 회원가입 시 제공한 개인정보 중 비밀번호를 가지고 있지 않으며 이와 관련된 부분은 사이트의 개인정보처리방침을 따릅니다. 운영자는 관계 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위하여 노력합니다.</p>
                    <p className="mt-2 text-amber-700 font-medium italic">※ 단, 회원의 귀책 사유로 인해 노출된 정보에 대해 운영자는 일체의 책임을 지지 않습니다.</p>
                  </section>

                  {/* 제7조 ~ 제10조 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제7조 (운영자의 의무)</h3>
                    <p>① 운영자는 이용회원으로부터 제기되는 의견이나 불만이 정당하다고 인정할 경우에는 가급적 빨리 처리하여야 합니다.</p>
                    <p>② 운영자는 계속적이고 안정적인 사이트 제공을 위하여 설비에 장애가 생기거나 유실된 때에는 이를 수리 또는 복구할 수 있도록 요구할 수 있습니다. 단, 천재지변 등 부득이한 경우 서비스가 일시 정지될 수 있습니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제8조 (회원의 의무)</h3>
                    <p>① 회원은 본 약관, 관계 법령 및 사이트 공지사항을 준수하여야 하며, 사이트 명예 손상이나 업무 방해 행위를 해서는 안 됩니다.</p>
                    <p>② 서비스 이용 권한을 타인에게 양도, 증여하거나 담보로 제공할 수 없습니다.</p>
                    <p>③ 이용고객은 아이디 및 비밀번호 관리에 상당한 주의를 기울여야 합니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제9조 (서비스 이용 시간)</h3>
                    <p>서비스 이용 시간은 1일 24시간 연중무휴를 원칙으로 합니다. 단, 점검이나 천재지변, 서비스 이용 폭주 등 불가항력적인 사유 시 서비스가 일시 중단될 수 있습니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제10조 (서비스 이용 해지)</h3>
                    <p>회원이 이용계약을 해지하고자 하는 경우에는 본인이 온라인을 통하여 등록해지 신청을 하여야 하며, 해지 신청 시 회원의 정보는 즉시 삭제됩니다.</p>
                  </section>

                  {/* 제11조 강조 */}
                  <section className="bg-red-50/50 p-5 rounded-lg border border-red-100">
                    <h3 className="text-base font-bold text-red-900 mb-2">제11조 (서비스 이용 제한)</h3>
                    <p>회원은 다음 행위를 하여서는 안 되며, 위반 시 서비스 이용 제한 및 계약 해지가 가능합니다.</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-red-800/80">
                      <li>타인의 정보 도용 및 허위 내용 등록</li>
                      <li>사이트 운영진 또는 관계자 사칭</li>
                      <li>타인의 지적재산권 침해 및 업무 방해</li>
                      <li>범죄와 결부된다고 판단되는 행위</li>
                    </ul>
                  </section>

                  {/* 제12조 ~ 제14조 */}
                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제12조 (게시물의 관리)</h3>
                    <p>운영자는 불량 게시물을 모니터링하여 삭제하거나 경고할 수 있습니다. 게시물 판단 기준은 모욕, 명예 훼손, 불법 복제 조장, 상업적 광고 등입니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제13조 (게시물의 보관)</h3>
                    <p>사이트 운영자가 불가피한 사정으로 사이트를 중단하게 될 경우, 회원에게 사전 공지를 하고 게시물 이전에 최선을 다합니다.</p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold text-slate-900 mb-2">제14조 (게시물에 대한 저작권)</h3>
                    <p>회원이 게시한 게시물의 저작권은 회원에게 귀속됩니다. 사이트는 게시자의 동의 없이 게시물을 상업적으로 이용할 수 없으나 서비스 내 게재권을 갖습니다.</p>
                  </section>

                  {/* 제15조 (손해배상) - 추가 완료 */}
                  <section className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                    <h3 className="text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <ShieldAlert size={18} className="text-blue-600" />
                      제15조 (손해배상)
                    </h3>
                    <div className="space-y-2">
                      <p>① 본 사이트에서 발생한 모든 민, 형사상 책임은 1차적으로 행위 당사자인 <strong>회원 본인</strong>에게 있습니다.</p>
                      <p>② 운영자는 천재지변 등 불가항력적이거나, 회원의 고의 또는 과실로 인하여 발생한 손해에 대해서는 배상 책임을 지지 않습니다.</p>
                      <p>③ 회원이 약관을 위반하여 운영자나 제3자에게 손해를 끼친 경우, 해당 회원은 그 손해를 배상하여야 합니다.</p>
                    </div>
                  </section>

                  {/* 제16조 (면책) */}
                  <section className="p-5 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={18} className="text-amber-600" />
                      제16조 (면책)
                    </h3>
                    <p className="text-amber-800/90 leading-relaxed">
                      운영자는 고의 없는 시스템 장애, 제3자의 해킹 공격, 컴퓨터 바이러스 유포 등 운영자가 통제할 수 없는 불가항력적 사유로 인한 회원의 손해에 대하여 책임을 지지 않습니다. 또한 회원 상호 간 물품 거래 등 서비스 외적인 활동에 대해서도 책임을 지지 않습니다.
                    </p>
                  </section>

                  {/* 부칙 */}
                  <div className="pt-10 border-t border-slate-200 text-center">
                    <p className="font-bold text-slate-900 underline decoration-blue-300 decoration-4 underline-offset-4">
                      부칙: 이 약관은 2026년 3월 27일부터 시행합니다.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 하단 버튼 */}
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={() => navigate('/')} className="px-12 bg-blue-600 hover:bg-blue-700 shadow-md">
            모든 약관 확인 완료
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;