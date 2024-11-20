import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ContactSuccess() {
  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
        >
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">送信完了</h2>
          <p className="text-muted-foreground">
            お問い合わせありがとうございます。
            <br />
            確認メールを送信いたしましたので、ご確認ください。
          </p>
        </div>

        <Button onClick={() => window.location.reload()}>
          新しいお問い合わせ
        </Button>
      </motion.div>
    </div>
  );
}
