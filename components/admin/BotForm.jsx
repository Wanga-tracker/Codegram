import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { botSchema } from "@/lib/schemas";
import { createBot } from "@/lib/supabaseBots";
import toast from "react-hot-toast";

export default function BotForm({ onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(botSchema),
  });

  const onSubmit = async (data) => {
    const { error } = await createBot(data);
    if (error) {
      toast.error("Error adding bot");
    } else {
      toast.success("Bot added successfully");
      reset();
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-4 rounded-lg shadow">
      <input {...register("name")} placeholder="Bot Name" className="input" />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}

      <input {...register("developer_name")} placeholder="Developer" className="input" />
      <textarea {...register("description")} placeholder="Description" className="input" />
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary"
      >
        {isSubmitting ? "Saving..." : "Add Bot"}
      </button>
    </form>
  );
    }
