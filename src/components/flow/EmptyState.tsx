import { Keyboard, MousePointer2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/stores/useTaskStore";

export const EmptyState = () => {
  const createRootTask = useTaskStore((state) => state.createRootTask);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] z-10 overflow-auto py-12">
      <div className="max-w-2xl w-full p-8 text-center space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            มาเริ่มสร้าง Mindmap กัน!
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            จะเริ่มจากหน้าว่างๆ หรือใช้เทมเพลตช่วยจัดระเบียบโปรเจกต์ก็ได้นะ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={createRootTask}
            className="w-full sm:w-auto gap-2 rounded-full px-10 h-12 shadow-lg hover:shadow-xl transition-all font-bold text-base"
          >
            <PlusCircle className="h-5 w-5" />
            สร้างบอร์ดใหม่เลย
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px w-12 bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              หรือจะลองใช้เทมเพลตดี?
            </span>
            <div className="h-px w-12 bg-border" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/50 border shadow-sm">
            <Keyboard className="h-5 w-5 text-muted-foreground" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              ใช้คีย์บอร์ด
            </div>
            <div className="text-xs space-y-1.5 text-foreground/80">
              <p className="flex items-center gap-1.5 justify-center">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">
                  Enter
                </kbd>
                <span>เพิ่มกิ่งย่อย</span>
              </p>
              <p className="flex items-center gap-1.5 justify-center">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono">
                  Tab
                </kbd>
                <span>ดูเฉพาะส่วนนี้</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card/50 border shadow-sm">
            <MousePointer2 className="h-5 w-5 text-muted-foreground" />
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              ใช้เมาส์
            </div>
            <div className="text-xs space-y-1.5 text-foreground/80">
              <p>ดับเบิลคลิกเพื่อแก้ข้อความ</p>
              <p>ลากเพื่อย้ายที่โหนด</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
