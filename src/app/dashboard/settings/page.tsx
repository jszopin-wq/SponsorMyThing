"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, User, Building, Globe, Phone, Mail } from "lucide-react";

export default function SettingsPage() {
    const [orgName, setOrgName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [orgType, setOrgType] = useState("nonprofit");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (data) {
                setOrgName(data.org_name || "");
                setContactEmail(data.contact_email || "");
                setPhone(data.phone || "");
                setWebsite(data.website || "");
                setOrgType(data.org_type || "nonprofit");
            }
            setLoading(false);
        };

        loadProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from("profiles")
            .update({
                org_name: orgName,
                contact_email: contactEmail,
                phone,
                website,
                org_type: orgType,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            </div>
        );
    }

    const orgTypes = [
        { value: "nonprofit", label: "Non-Profit" },
        { value: "pta", label: "PTA / PTO" },
        { value: "youth-sports", label: "Youth Sports League" },
        { value: "charity", label: "Charity" },
        { value: "school", label: "School" },
        { value: "other", label: "Other" },
    ];

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-surface-100">Settings</h1>
                <p className="mt-1 text-surface-400">Manage your organization profile.</p>
            </div>

            <div className="glass-card p-8">
                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label htmlFor="org-name" className="mb-1.5 block text-sm font-medium text-surface-300">
                            Organization Name
                        </label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                            <input
                                id="org-name"
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="input-field pl-10"
                                placeholder="Your Organization"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-surface-300">Organization Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {orgTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setOrgType(type.value)}
                                    className={`rounded-lg border px-3 py-2 text-sm transition-all ${orgType === type.value
                                            ? "border-brand-500 bg-brand-500/10 text-brand-300"
                                            : "border-surface-700/50 text-surface-400 hover:border-surface-600"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-surface-300">
                            Contact Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                            <input
                                id="contact-email"
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="input-field pl-10"
                                placeholder="contact@yourorg.org"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-surface-300">
                            Phone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-field pl-10"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="website" className="mb-1.5 block text-sm font-medium text-surface-300">
                            Website
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" />
                            <input
                                id="website"
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="input-field pl-10"
                                placeholder="https://yourorg.org"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : saved ? (
                                "✓ Saved!"
                            ) : (
                                <>
                                    <Save className="h-4 w-4" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
