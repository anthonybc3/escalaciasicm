import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Teacher, Class, MonthlySchedule, User, Church } from "../types";
import { generateId } from "../lib/utils";

export function useAppStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<MonthlySchedule[]>([]);

  const [churchName, setChurchName] = useState<string>("");
  const [churchLogo, setChurchLogo] = useState<string | null>(null);
  const [ciasLogo, setCiasLogo] = useState<string | null>(null);

  const login = (user: User) => setCurrentUser(user);
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      setCurrentUser({
        id: data.id,
        email: data.username,
        username: data.username,
        name: data.name,
        role: data.role,
        churchId: data.church_id,
        managedChurchIds: data.managed_church_ids,
        status: data.status,
      } as User);
    }
  };

  const loadCloudData = async () => {


    // Fetch Users
    const { data: usersData, error: uErr } = await supabase.from('profiles').select('*');
    if (uErr) console.error("users fetch error", uErr);
    if (usersData) {
      setUsers(usersData.map(u => ({
        id: u.id, username: u.username, name: u.name, role: u.role, churchId: u.church_id, managedChurchIds: u.managed_church_ids, status: u.status
      } as User)));
    }

    // Fetch Churches
    const { data: churchesData, error: cErr } = await supabase.from('churches').select('*');
    if (cErr) console.error("churches fetch error", cErr);
    if (churchesData) setChurches(churchesData.map(c => ({ id: c.id, name: c.name })));

    // Fetch Teachers
    const { data: teachersData, error: tErr } = await supabase.from('teachers').select('*');
    if (tErr) console.error("teachers fetch error", tErr);
    if (teachersData) setTeachers(teachersData.map(t => ({ id: t.id, name: t.name, classId: t.class_id, churchId: t.church_id })));

    // Fetch Classes
    const { data: classesData, error: clErr } = await supabase.from('classes').select('*');
    if (clErr) console.error("classes fetch error", clErr);
    if (classesData) setClasses(classesData.map(c => ({ id: c.id, churchId: c.church_id, name: c.name, dayOfWeek: c.day_of_week, isActive: c.is_active } as Class)));

    // Fetch Schedules
    const { data: schedulesData, error: sErr } = await supabase.from('monthly_schedules').select('*');
    if (sErr) console.error("schedules fetch error", sErr);
    if (schedulesData) setSchedules(schedulesData.map(s => ({ id: s.id, month: s.month, year: s.year, churchId: s.church_id, classes: s.classes })));
  };

  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        loadCloudData();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
        loadCloudData();
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth/Users API
  const addUser = (user: User) => setUsers(prev => [...prev, user]);
  const updateUser = async (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    const { error } = await supabase.from('profiles').update({
      role: updated.role,
      status: updated.status,
      church_id: updated.churchId,
      managed_church_ids: updated.managedChurchIds
    }).eq('id', updated.id);
    if (error) console.error("Error updating profile:", error);
  };

  // Churches API
  const addChurch = async (church: Church) => {
    const exists = churches.some(c => c.name.toLowerCase() === church.name.toLowerCase());
    if (exists) {
      return { success: false, error: 'Já existe uma igreja com este nome.' };
    }
    
    setChurches(prev => [...prev, church]);
    const { error } = await supabase.from('churches').insert({ id: church.id, name: church.name });
    if (error) {
      console.error("Error adding church:", error);
      // rollback locally if failed
      setChurches(prev => prev.filter(c => c.id !== church.id));
      if (error.code === '23505') { // Postgres unique violation
        return { success: false, error: 'Já existe uma igreja com este nome.' };
      }
      return { success: false, error: 'Erro ao adicionar a igreja no servidor.' };
    }

    // Criar as classes padrão
    const defaultClasses: Class[] = [
      { id: generateId(), churchId: church.id, name: 'Bebês 0 a 3', dayOfWeek: 0, isActive: true },
      { id: generateId(), churchId: church.id, name: 'Crianças', dayOfWeek: 0, isActive: true },
      { id: generateId(), churchId: church.id, name: 'Intermediários', dayOfWeek: 0, isActive: true },
      { id: generateId(), churchId: church.id, name: 'Adolescentes', dayOfWeek: 0, isActive: true },
    ];

    setClasses(prev => [...prev, ...defaultClasses]);
    
    const classesToInsert = defaultClasses.map(c => ({
      id: c.id,
      church_id: c.churchId,
      name: c.name,
      day_of_week: c.dayOfWeek,
      is_active: c.isActive
    }));

    const { error: classesError } = await supabase.from('classes').insert(classesToInsert);
    if (classesError) {
      console.error("Error adding default classes:", classesError);
    }

    return { success: true };
  };
  const updateChurch = async (updated: Church) => {
    const exists = churches.some(c => c.id !== updated.id && c.name.toLowerCase() === updated.name.toLowerCase());
    if (exists) {
      return { success: false, error: 'Já existe uma igreja com este nome.' };
    }

    setChurches(prev => prev.map(c => c.id === updated.id ? updated : c));
    const { error } = await supabase.from('churches').update({ name: updated.name }).eq('id', updated.id);
    if (error) {
      console.error("Error updating church:", error);
      // we could rollback here, but for simplicity just return error
      if (error.code === '23505') {
        return { success: false, error: 'Já existe uma igreja com este nome.' };
      }
      return { success: false, error: 'Erro ao atualizar a igreja.' };
    }
    return { success: true };
  };
  const deleteChurch = async (id: string) => {
    setChurches(prev => prev.filter(c => c.id !== id));
    setTeachers(prev => prev.filter(t => t.churchId !== id));
    setClasses(prev => prev.filter(c => c.churchId !== id));
    setSchedules(prev => prev.filter(s => s.churchId !== id));
    const { error } = await supabase.from('churches').delete().eq('id', id);
    if (error) console.error("Error deleting church:", error);
  };

  // Teachers API
  const addTeacher = async (teacher: Teacher) => {
    setTeachers((prev) => [...prev, teacher]);
    const { error } = await supabase.from('teachers').insert({ id: teacher.id, name: teacher.name, class_id: teacher.classId, church_id: teacher.churchId });
    if (error) console.error("Error adding teacher:", error);
  };
  const updateTeacher = async (updated: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    const { error } = await supabase.from('teachers').update({ name: updated.name, class_id: updated.classId, church_id: updated.churchId }).eq('id', updated.id);
    if (error) console.error("Error updating teacher:", error);
  };
  const removeTeacher = async (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) console.error("Error removing teacher:", error);
  };

  // Classes API
  const addClass = async (c: Class) => {
    setClasses((prev) => [...prev, c]);
    const { error } = await supabase.from('classes').insert({ id: c.id, church_id: c.churchId, name: c.name, day_of_week: c.dayOfWeek, is_active: c.isActive });
    if (error) console.error("Error adding class:", error);
  };
  const updateClass = async (updated: Class) => {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    const { error } = await supabase.from('classes').update({ name: updated.name, day_of_week: updated.dayOfWeek, is_active: updated.isActive }).eq('id', updated.id);
    if (error) console.error("Error updating class:", error);
  };
  const removeClass = async (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setTeachers((prev) => prev.filter((t) => t.classId !== id)); // Cascades in state
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) console.error("Error removing class:", error);
  };

  // Schedules API
  const saveSchedule = async (schedule: MonthlySchedule) => {
    setSchedules((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.month === schedule.month && s.year === schedule.year && s.churchId === schedule.churchId,
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = schedule;
        return next;
      }
      return [...prev, schedule];
    });
    const { error } = await supabase.from('monthly_schedules').upsert({ id: schedule.id, month: schedule.month, year: schedule.year, church_id: schedule.churchId, classes: schedule.classes });
    if (error) console.error("Error saving schedule:", error);
  };

  const deleteSchedule = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    const { error } = await supabase.from('monthly_schedules').delete().eq('id', id);
    if (error) console.error("Error deleting schedule:", error);
  };

  return {
    currentUser,
    login,
    logout,
    users,
    addUser,
    updateUser,
    churches,
    addChurch,
    updateChurch,
    deleteChurch,
    teachers,
    addTeacher,
    updateTeacher,
    removeTeacher,
    classes,
    addClass,
    updateClass,
    removeClass,
    schedules,
    saveSchedule,
    deleteSchedule,
    churchName,
    setChurchName,
    churchLogo,
    setChurchLogo,
    ciasLogo,
    setCiasLogo,
  };
}
