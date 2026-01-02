import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FormButtonProps {
  onClick?: () => void;
  label?: string;
}

export default function FormButton({ onClick, label = "Submit" }: FormButtonProps) {
  return (
    <Button 
      onClick={onClick}
      className="bg-[#804B23] hover:bg-[#6d3f1d] text-white rounded-full px-8 h-12 text-base font-medium flex items-center gap-2 shadow-none"
    >
      {label} <ArrowRight className="w-4 h-4" />
    </Button>
  );
}
