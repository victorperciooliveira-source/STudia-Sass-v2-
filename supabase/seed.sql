-- ============================================================
-- STUDIA - SEED DATA DEMO (POSTGRESQL / SUPABASE)
-- ============================================================

DO $$
DECLARE
  v_teacher_id uuid;
  v_teacher_name text;
BEGIN
  -- Obter primeiro professor disponível
  SELECT p.id, coalesce(p.display_name, p.email)
  INTO v_teacher_id, v_teacher_name
  FROM public.profiles p
  LEFT JOIN public.user_roles r ON r.user_id = p.id
  WHERE r.role = 'teacher' OR r.role IS NULL
  LIMIT 1;

  IF v_teacher_name IS NULL THEN
    v_teacher_name := 'Prof. Carlos Alberto';
  END IF;

  -- Inserir 4 aulas com diferentes estados demonstrativos
  INSERT INTO public.schedules (date, start_time, end_time, subject, room, class_group, teacher_id, teacher_name, status)
  VALUES 
    (CURRENT_DATE, '07:30', '08:20', 'Matemática Aplicada', 'Sala 101', '3º Ano A - EM', v_teacher_id, v_teacher_name, 'confirmed'),
    (CURRENT_DATE, '08:20', '09:10', 'Física Moderna', 'Laboratório 2', '3º Ano A - EM', v_teacher_id, v_teacher_name, 'pending'),
    (CURRENT_DATE, '09:30', '10:20', 'Química Orgânica', 'Laboratório 1', '2º Ano B - EM', v_teacher_id, v_teacher_name, 'absent'),
    (CURRENT_DATE, '10:20', '11:10', 'Biologia Celular', 'Sala 204', '1º Ano C - EM', v_teacher_id, v_teacher_name, 'vaga');

END $$;
