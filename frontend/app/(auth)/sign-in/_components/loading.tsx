import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function Loading() {
  return (
    <div className="space-y-5">
      <Field className="gap-0">
        <FieldLabel
          className="mb-1.5 text-sm font-medium text-blue-100"
          htmlFor="email"
        >
          Email address
        </FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
        />
      </Field>

      <Field className="gap-0">
        <div className="flex items-center justify-between mb-1.5">
          <FieldLabel
            htmlFor="password"
            className="text-sm font-medium text-blue-100"
          >
            Password
          </FieldLabel>
          <span className="text-xs text-blue-200 font-medium">
            Forgot password?
          </span>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••••••"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
        />
      </Field>

      <button
        type="submit"
        className="w-full bg-white text-blue-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center mt-2 opacity-70"
      >
        Sign in
      </button>
    </div>
  );
}
