DROP POLICY IF EXISTS "Anyone can view work requests" ON public.work_requests;
CREATE POLICY "Owners and contributors can view work requests" ON public.work_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'contributor'));
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.answer_ratings;
CREATE POLICY "Signed-in users can view ratings" ON public.answer_ratings FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);