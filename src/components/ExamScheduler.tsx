import React, { useEffect, useMemo, useState } from "react";
import { AlarmClock, Bell, CalendarClock, Check, Trash2 } from "lucide-react";

export interface ScheduledExam {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  startsAt: string;
  reminderSent?: boolean;
}

const STORAGE_KEY = "hsc_2027_scheduled_exams_v1";

function readScheduled(): ScheduledExam[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.filter((x) => x && typeof x.id === "string" && typeof x.startsAt === "string") : [];
  } catch {
    return [];
  }
}

function notify(title: string, body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, tag: "hsc-exam-reminder" });
    }
  } catch (error) {
    console.warn("Notification unavailable", error);
  }
}

export const ExamScheduler: React.FC = () => {
  const [scheduled, setScheduled] = useState<ScheduledExam[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Biology");
  const [chapter, setChapter] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [notice, setNotice] = useState("");

  useEffect(() => { setScheduled(readScheduled()); }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scheduled));
  }, [scheduled]);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      setScheduled((items) => {
        let changed = false;
        const next = items.map((item) => {
          const start = new Date(item.startsAt).getTime();
          if (!item.reminderSent && Number.isFinite(start) && start - now <= 10 * 60 * 1000 && start - now > 0) {
            changed = true;
            notify("পরীক্ষা ১০ মিনিট পরে", item.title + " · " + item.subject + (item.chapter ? " · " + item.chapter : ""));
            return { ...item, reminderSent: true };
          }
          if (!item.reminderSent && Number.isFinite(start) && start <= now) {
            changed = true;
            return { ...item, reminderSent: true };
          }
          return item;
        });
        return changed ? next : items;
      });
    };
    check();
    const timer = window.setInterval(check, 15_000);
    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  const upcoming = useMemo(() => [...scheduled].sort((a,b) => a.startsAt.localeCompare(b.startsAt)), [scheduled]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      setNotice("এই ব্রাউজারে notification সাপোর্ট নেই।");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setNotice(result === "granted" ? "Notification চালু হয়েছে।" : "Notification অনুমতি না দিলে reminder নীরবে থাকবে।");
    } catch {
      setNotice("Notification অনুমতি চাওয়া যায়নি।");
    }
  };

  const addSchedule = (event: React.FormEvent) => {
    event.preventDefault();
    const start = new Date(startsAt).getTime();
    if (!title.trim() || !subject.trim() || !Number.isFinite(start) || start <= Date.now()) {
      setNotice("ভবিষ্যতের সঠিক তারিখ ও সময় দিয়ে পরীক্ষার নাম পূরণ করো।");
      return;
    }
    setScheduled((items) => [...items, {
      id: crypto.randomUUID(),
      title: title.trim(),
      subject: subject.trim(),
      chapter: chapter.trim(),
      startsAt: new Date(start).toISOString(),
    }]);
    setTitle("");
    setChapter("");
    setStartsAt("");
    setNotice("পরীক্ষার সময়সূচি সেভ হয়েছে। ১০ মিনিট আগে reminder দেখানো হবে যখন অ্যাপ/ব্রাউজার চলমান থাকবে।");
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-700"><CalendarClock className="w-6 h-6"/></div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">পরীক্ষার সময়সূচি ও রিমাইন্ডার</h2>
              <p className="text-sm text-slate-500 mt-1">আগে থেকেই পরীক্ষা যোগ করো—১০ মিনিট আগে notification দেওয়ার চেষ্টা করবে।</p>
            </div>
          </div>
          <button type="button" onClick={requestPermission} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm font-semibold">
            <Bell className="w-4 h-4"/> {permission === "granted" ? "Notification চালু" : "Notification চালু করো"}
          </button>
        </div>

        <form onSubmit={addSchedule} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="পরীক্ষার নাম (যেমন: Unit 5 Test)" className="min-w-0 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="বিষয় (যেমন: Biology)" className="min-w-0 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
          <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="অধ্যায়/ইউনিট (ঐচ্ছিক)" className="min-w-0 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} min={new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0,16)} className="min-w-0 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
          <button type="submit" className="sm:col-span-2 lg:col-span-4 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-bold py-3 hover:bg-indigo-700"><Check className="w-4 h-4"/> সময়সূচি সেভ করো</button>
        </form>

        {notice && <p role="status" className="mt-3 text-sm text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2">{notice}</p>}
        <div className="mt-6 space-y-2">
          {upcoming.length === 0 ? <p className="text-sm text-slate-500 py-4 text-center">এখনো কোনো পরীক্ষা schedule করা হয়নি।</p> : upcoming.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <AlarmClock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5"/>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 break-words">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.subject}{item.chapter ? " · " + item.chapter : ""}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(item.startsAt).toLocaleString()} {item.reminderSent ? "· reminder check সম্পন্ন" : "· ১০ মিনিট আগে reminder নির্ধারিত"}</p>
                </div>
              </div>
              <button type="button" onClick={() => setScheduled((items) => items.filter((x) => x.id !== item.id))} className="self-end sm:self-auto inline-flex items-center gap-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg px-3 py-2"><Trash2 className="w-4 h-4"/> মুছুন</button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 leading-relaxed">সতর্কতা: scheduled reminder এই ডিভাইসে সেভ হয়। ব্রাউজার/অ্যাপ বন্ধ, OS-এর background restriction, বা notification permission বন্ধ থাকলে alarm নাও আসতে পারে। পুরোপুরি বন্ধ অবস্থায় reliable alarm-এর জন্য native Android scheduled-notification support প্রয়োজন।</p>
      </div>
    </section>
  );
};
