import React from "react";
import { X, Award, CheckCircle, Lightbulb, Clock } from "lucide-react";

interface GuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelineModal: React.FC<GuidelineModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                HSC 2027 বোর্ড নির্দেশিকা ও উত্তর লিখন কৌশল
              </h3>
              <p className="text-xs text-slate-500">
                NCTB সিলেবাস ও বোর্ড পরীক্ষার ১০/১০ সৃজনশীল মার্কিং কৌশল
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* CQ Section Rules */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>সৃজনশীল প্রশ্নের ৪টি স্তরের নম্বর বণ্টন</span>
            </h4>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block text-xs uppercase text-indigo-700">
                  'ক' অংশ: জ্ঞানমূলক (১ নম্বর)
                </span>
                <p className="text-xs sm:text-sm mt-0.5 text-slate-600">
                  কোনো অপ্রয়োজনীয় ভূমিকা ছাড়াই এক বা দুটি বাক্যে সরাসরি সংজ্ঞা বা সূত্রের নাম লিখবে। সঠিক উত্তর দিলে পূর্ণ ১ নম্বর পাওয়া যায়।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block text-xs uppercase text-indigo-700">
                  'খ' অংশ: অনুধাবনমূলক (২ নম্বর)
                </span>
                <p className="text-xs sm:text-sm mt-0.5 text-slate-600">
                  দুটি প্যারায় লিখলে ভালো হয়—প্রথম প্যারায় মূল ভাব/জ্ঞান (১ নম্বর) এবং দ্বিতীয় প্যারায় তার সুস্পষ্ট ব্যাখ্যা বা কারণ (১ নম্বর)।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block text-xs uppercase text-indigo-700">
                  'গ' অংশ: প্রয়োগমূলক (৩ নম্বর)
                </span>
                <p className="text-xs sm:text-sm mt-0.5 text-slate-600">
                  উদ্দীপকের তথ্যের সাথে পাঠ্যবইয়ের সূত্র প্রয়োগ করে গাণিতিক সমাধান বা কার্যকারণ নির্ণয় করতে হবে। ৩টি ধাপ: সূত্র ও প্রদত্ত মান (১), গণনা (১) এবং সঠিক এককসহ উত্তর ও সিদ্ধান্ত (১)।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block text-xs uppercase text-indigo-700">
                  'ঘ' অংশ: উচ্চতর দক্ষতামূলক (৪ নম্বর)
                </span>
                <p className="text-xs sm:text-sm mt-0.5 text-slate-600">
                  তুলনামূলক বিশ্লেষণ, যৌক্তিক মন্তব্য, বিকল্প পরিস্থিতি যাচাই অথবা সিদ্ধান্ত প্রদান। এখানে স্পষ্ট যুক্তি এবং উদ্দীপকের সাপেক্ষে মতামত আবশ্যক।
                </p>
              </div>
            </div>
          </div>

          {/* Time Management Tips */}
          <div>
            <h4 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>বোর্ড পরীক্ষার আদর্শ সময় বণ্টন</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block text-xs">সৃজনশীল সময় (২ ঘণ্টা ৩০ মিনিট)</span>
                <p className="text-xs text-slate-600 mt-1">
                  প্রতিটি CQ লেখার জন্য সর্বোচ্চ ২০-২১ মিনিট ব্যয় করবে। বাকি ১০-১৫ মিনিট রিভিশনের জন্য রাখবে।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-900 block text-xs">MCQ সময় (৩০ মিনিট)</span>
                <p className="text-xs text-slate-600 mt-1">
                  প্রতিটি প্রশ্নের জন্য গড়ে ৫০-৫৫ সেকেন্ড। কঠিন গণনাযুক্ত প্রশ্নগুলোকে মার্ক করে রেখে শেষে সমাধান করো।
                </p>
              </div>
            </div>
          </div>

          {/* AI Lab Advice */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-950 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>খাতায় ছবি তুলে আপলোড করার সময় লক্ষণীয়</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-indigo-900">
              <li>পর্যাপ্ত আলোয় ওপর থেকে সোজা করে পরিষ্কার ছবি তোলো।</li>
              <li>ক, খ, গ, ঘ পরিষ্কার করে চিহ্নিত রাখো যাতে OCR সঠিকভাবে পড়তে পারে।</li>
              <li>গাণিতিক সূত্রের একক ও ধাপ পরিষ্কার রাখলে পূর্ণ নম্বর পাওয়া সহজ হয়।</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
          >
            বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
};
