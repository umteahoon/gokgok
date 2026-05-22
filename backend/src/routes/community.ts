// 2026.04.10 주환 (any 완벽 제거 및 이미지 증발 결함 패치 최종본)
import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import multer from 'multer';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

dotenv.config();
const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- 엄격한 DTO 인터페이스 정의 ---
interface IdParams extends ParamsDictionary {
  id: string;
}

interface PostIdParams extends ParamsDictionary {
  postId: string;
}

interface CommentParams extends ParamsDictionary {
  postId: string;
  commentId: string;
}

interface UserEmailBody {
  user_email: string;
}

interface CreateCommentBody {
  author: string;
  author_email: string;
  text: string;
}

interface CommunityQuery extends ParsedQs {
  email?: string;
  author_email?: string;
}

// --------------------------------

/**
 * 1. [게시글 목록 불러오기] GET /api/community
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, commentsList:comments(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedPosts = data?.map((post) => ({
      ...post,
      likes_count: post.likes || 0
    }));

    return res.json({ success: true, posts: mappedPosts });
  } catch (error: unknown) {
    console.error('게시글 로드 에러:', error);
    return res.status(500).json({ success: false, message: '게시글을 불러오지 못했습니다.' });
  }
});

/**
 * 2. [내 좋아요 목록 불러오기 API] POST /api/community/my-likes
 */
router.post('/my-likes', async (req: Request<ParamsDictionary, Record<string, unknown>, UserEmailBody>, res: Response) => {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res.json({ success: true, likes: [] });
    }

    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_email', user_email);

    if (error) throw error;
    return res.json({ success: true, likes: data });
  } catch (error: unknown) {
    console.error('좋아요 목록 조회 에러:', error);
    return res.status(500).json({ success: false, message: '좋아요 목록 조회 실패' });
  }
});

/**
 * 3. [좋아요 토글 API] POST /api/community/:id/like
 */
router.post('/:id/like', async (req: Request<IdParams, Record<string, unknown>, UserEmailBody>, res: Response) => {
  try {
    const { id } = req.params;
    const { user_email } = req.body;

    if (!user_email) return res.status(400).json({ success: false, message: "로그인 필요" });

    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', id)
      .eq('user_email', user_email)
      .single();

    const { data: post } = await supabase.from('community_posts').select('likes').eq('id', id).single();
    const currentLikes = post?.likes || 0;

    if (existingLike) {
      await supabase.from('post_likes').delete().eq('id', existingLike.id);
      const { data: updated } = await supabase.from('community_posts')
        .update({ likes: Math.max(0, currentLikes - 1) }).eq('id', id).select().single();
      
      return res.json({ success: true, isLiked: false, likes: updated?.likes || 0 });
    } else {
      await supabase.from('post_likes').insert([{ post_id: id, user_email }]);
      const { data: updated } = await supabase.from('community_posts')
        .update({ likes: currentLikes + 1 }).eq('id', id).select().single();
      
      return res.json({ success: true, isLiked: true, likes: updated?.likes || 0 });
    }
  } catch (error: unknown) {
    console.error('좋아요 토글 에러:', error);
    return res.status(500).json({ success: false, message: '좋아요 처리 실패' });
  }
});

/**
 * 4. [새 게시글 작성] POST /api/community
 */
router.post('/', upload.array('images'), async (req: Request, res: Response) => {
  try {
    const { author, author_email, title, content, category } = req.body;
    const files = req.files as Express.Multer.File[]; 
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('community_images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) throw new Error(`이미지 서버 저장 실패: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage
          .from('community_images')
          .getPublicUrl(fileName);
        imageUrls.push(publicUrl);
      }
    }

    const { data, error: dbError } = await supabase
      .from('community_posts')
      .insert([{
        author: author || "익명",
        author_email: author_email || "",
        title: title || "제목 없음",
        content: content || "",
        category: category || "기타",
        images: imageUrls,
        status: 'active',
        likes: 0 
      }])
      .select();

    if (dbError) throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
    return res.status(201).json({ success: true, post: data?.[0] });
  } catch (error: unknown) {
    console.error('게시글 작성 에러:', error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : '알 수 없는 오류' });
  }
});

/**
 * 5. [게시글 삭제] DELETE /api/community/:id
 */
router.delete('/:id', async (req: Request<IdParams, Record<string, unknown>, Record<string, unknown>, CommunityQuery>, res: Response) => {
  try {
    const { id } = req.params;
    const author_email = req.query.email || req.query.author_email;

    if (!author_email) {
      return res.status(400).json({ success: false, message: '삭제 요청자 인증 정보가 필요합니다.' });
    }

    const { data, error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id)
      .eq('author_email', author_email)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(403).json({ success: false, message: '삭제 권한이 없거나 존재하지 않는 글입니다.' });
    }

    return res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error: unknown) {
    console.error('게시글 삭제 에러:', error);
    return res.status(500).json({ success: false, message: '삭제 실패' });
  }
});

/**
 * 6. [새 댓글 작성] POST /api/community/:postId/comments
 */
router.post('/:postId/comments', async (req: Request<PostIdParams, Record<string, unknown>, CreateCommentBody>, res: Response) => {
  try {
    const { postId } = req.params;
    const { author, author_email, text } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, author, author_email, text }])
      .select()
      

    if (error) throw error;
    return res.status(201).json({ success: true, comment: data });
  } catch (error: unknown) {
    console.error('댓글 작성 에러:', error);
    return res.status(500).json({ success: false, message: '댓글 작성 실패' });
  }
});

/**
 * 7. [댓글 삭제] DELETE /api/community/:postId/comments/:commentId
 */
router.delete('/:postId/comments/:commentId', async (req: Request<CommentParams, Record<string, unknown>, Record<string, unknown>, CommunityQuery>, res: Response) => {
  try {
    const { commentId } = req.params;
    const author_email = req.query.email || req.query.author_email;

    if (!author_email) {
      return res.status(400).json({ success: false, message: '삭제 요청자 인증 정보가 필요합니다.' });
    }

    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_email', author_email)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
    }

    return res.json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (error: unknown) {
    console.error('댓글 삭제 에러:', error);
    return res.status(500).json({ success: false, message: '댓글 삭제 실패' });
  }
});

/**
 * 8. [게시글 수정] PUT /api/community/:id
 */
router.put('/:id', upload.array('images'), async (req: Request<IdParams>, res: Response) => {
  try {
    const { id } = req.params;
    const { author_email, title, content } = req.body;
    const files = req.files as Express.Multer.File[];

    // 💡 동적 빌딩 구조화: 값이 명시된 텍스트 필드만 먼저 초기화
    const updateData: Record<string, unknown> = {
      title,
      content,
      updated_at: new Date().toISOString()
    };

    // 💡 새로운 이미지 스트림이 유입된 케이스에만 배정 연산을 트리거 (사진 증발 원천 차단)
    if (files && files.length > 0) {
      const newUrls: string[] = [];
      for (const file of files) {
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${Date.now()}_${safeName}`;
        await supabase.storage.from('community_images').upload(fileName, file.buffer);
        const { data: { publicUrl } } = supabase.storage.from('community_images').getPublicUrl(fileName);
        newUrls.push(publicUrl);
      }
      updateData.images = newUrls;
    }

    const { data, error } = await supabase
      .from('community_posts')
      .update(updateData)
      .eq('id', id)
      .eq('author_email', author_email)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });

    return res.json({ success: true, post: data });
  } catch (error: unknown) {
    console.error('게시글 수정 에러:', error);
    return res.status(500).json({ success: false, message: '글 수정 실패' });
  }
});

export default router;