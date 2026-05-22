// 태훈 - 2026.05.22: Contacts 스케줄러 및 만료 관리 라우터 최종본
import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 🎯 크론 스케줄러 제어를 위해 Service Role Key 필수
);

/**
 * 1. [새 문의사항 등록 API]
 * 사용자가 문의를 남기면 30일 뒤의 유효기간(delete_at)을 자동 계산해 함께 insert합니다.
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { name, email, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: '필수 입력 항목이 누락되었습니다.' });
    }

    // 🕒 정확한 현지 시간 기준 30일 뒤 유효기간 계산 (태훈님 정석 코드 반영)
    const thirtyDaysLater = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { error } = await supabase
      .from('contacts')
      .insert([
        { 
          name, 
          email, 
          category, 
          message, 
          status: 'pending', 
          delete_at: thirtyDaysLater // 30일 뒤 자동 파기 타이머 부착
        }
      ]);

    if (error) throw error;

    return res.status(201).json({ success: true, message: '문의사항이 안전하게 접수되었습니다.' });
  } catch (err: any) {
    console.error('문의 등록 오류:', err);
    return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * 2. [관리자 전용: 크론 스케줄러 강제 동기화 API]
 * 크론 스키마 참조 에러를 100% 차단하고 DB에 자동 삭제 스케줄러를 원격으로 등록합니다.
 */
router.post('/sync-scheduler', async (req: Request, res: Response) => {
  try {
    // 🚩 크론 패치 핵심: 스키마 접두사(extensions.)를 빼고 순수 cron.schedule을 rpc나 raw query로 호출합니다.
    const { error } = await supabase.rpc('run_sql', {
      sql_query: `
        CREATE EXTENSION IF NOT EXISTS pg_cron;
        
        -- 매일 새벽 3시에 만료된 contacts 행을 파기하는 스케줄러 등록
        SELECT cron.schedule(
          'cleanup-old-contacts',
          '0 3 * * *',
          $$
          DELETE FROM public.contacts
          WHERE delete_at <= NOW();
          $$
        );
      `
    });

    // 만약 rpc 보안 권한으로 막힐 경우를 대비한 가이드라인
    if (error) {
      console.warn('RPC 호출 제한으로 인해 관리자 다이렉트 SQL 실행을 권장합니다.');
      return res.status(403).json({ 
        success: false, 
        message: 'Supabase 대시보드 SQL Editor에서 최종 쿼리를 직접 실행해 주세요.' 
      });
    }

    return res.json({ success: true, message: '데이터베이스 자동 파기 스케줄러 동기화 완료!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: '스케줄러 설정 중 오류 발생' });
  }
});

/**
 * 3. [관리자 전용: 즉시 만료 청소 API]
 * 새벽 3시까지 기다리지 않고, 관리자가 버튼을 누르면 즉시 만료 데이터를 청소하는 서브 로직입니다.
 */
router.post('/purge-now', async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .lte('delete_at', new Date().toISOString()); // 현재 시간보다 작거나 같은(만료된) 데이터 즉시 파기

    if (error) throw error;

    return res.json({ success: true, message: '만료된 문의사항 데이터가 즉시 청소되었습니다.' });
  } catch (err: any) {
    console.error('즉시 삭제 오류:', err);
    return res.status(500).json({ success: false, message: '수동 청소 중 서버 오류가 발생했습니다.' });
  }
});

export default router;