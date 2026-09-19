"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { createContactLead } from "@/lib/services/supportService";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactSection() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    need: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error(isAr ? "يرجى ملء جميع الحقول المطلوبة." : "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createContactLead(formData);
      setIsSubmitted(true);
      toast.success(
        isAr
          ? "تم استلام طلبكم بنجاح! سيتواصل معكم فريقنا خلال ساعتين."
          : "Demande reçue ! Notre équipe commerciale vous contacte sous 2h."
      );
      setFormData({ fullName: "", email: "", phone: "", need: "" });
    } catch (err: any) {
      toast.error(isAr ? "حدث خطأ أثناء الإرسال." : "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-white" id="contact">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-[2.5rem] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          {/* Halos d'ambiance en arrière-plan */}
          <div
            className="absolute -right-20 -top-20 w-96 h-96 bg-sky-500/20 blur-[100px] rounded-full pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -left-20 -bottom-20 w-96 h-96 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Informations de contact à gauche */}
            <div className="lg:col-span-6 space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-slate-800 text-sky-400 text-xs font-bold uppercase tracking-wider border border-slate-700 inline-block">
                {isAr ? "تواصل سريع" : "Prise de contact rapide"}
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {isAr ? "جاهز لتبسيط فواتيرك وتنمية أعمالك؟" : "Prêt à simplifier votre facturation ?"}
              </h2>

              <p className="text-slate-300 text-base leading-relaxed">
                {isAr
                  ? "اطلب عرضاً تجريبياً مخصصاً أو اطرح استفساراتك على خبرائنا في نواكشوط. نضمن الرد خلال ساعتي عمل."
                  : "Demandez une démonstration personnalisée ou posez vos questions à nos experts basés à Nouakchott. Réponse garantie sous 2 heures ouvrées."}
              </p>

              <div className="pt-4 space-y-4 text-sm text-slate-300">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <span className="font-medium">
                    {isAr ? "تفرغ زينة، نواكشوط، موريتانيا" : "Tevragh-Zeina & Ksar, Nouakchott, Mauritanie"}
                  </span>
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone size={16} />
                  </div>
                  <span className="font-medium">
                    +222 45 00 00 00 / WhatsApp +222 36 00 00 00
                  </span>
                </div>

                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
                    <Mail size={16} />
                  </div>
                  <span className="font-medium">contact@facturim.net</span>
                </div>
              </div>
            </div>

            {/* Formulaire de demande à droite */}
            <div className="lg:col-span-6">
              {isSubmitted ? (
                <div className="bg-white/10 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-emerald-500/30 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {isAr ? "شكراً لطلبكم!" : "Merci pour votre demande !"}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {isAr
                      ? "سيتواصل معكم مستشار FACTURIM المخصص في أقرب وقت عبر الهاتف أو واتساب."
                      : "Un conseiller FACTURIM dédié prendra contact avec vous dans les plus brefs délais par téléphone ou WhatsApp."}
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-semibold transition-all cursor-pointer"
                  >
                    {isAr ? "إرسال رسالة أخرى" : "Envoyer un autre message"}
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/15 space-y-4 shadow-xl"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isAr ? "الاسم الكامل *" : "Nom complet *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder={isAr ? "مثال: أحمد ولد محمد" : "Ex: Mohamed Lemine"}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                        {isAr ? "البريد المهني *" : "Email professionnel *"}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="contact@entreprise.mr"
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                        {isAr ? "الهاتف (Bankily/WhatsApp) *" : "Téléphone (Bankily/WhatsApp) *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+222 45..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {isAr ? "احتياجاتكم" : "Votre besoin"}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.need}
                      onChange={(e) =>
                        setFormData({ ...formData, need: e.target.value })
                      }
                      placeholder={
                        isAr
                          ? "أخبرنا عن نشاط شركتك ومتطلبات الفوترة الخاصة بك..."
                          : "Parlez-nous de votre entreprise et de vos besoins de facturation..."
                      }
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send size={16} />
                    <span>
                      {isSubmitting
                        ? (isAr ? "جاري الإرسال..." : "Envoi en cours...")
                        : (isAr ? "طلب عرض تجريبي مجاني" : "Demander une démo gratuite")}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
