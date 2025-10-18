import html2canvas from "html2canvas";
import { Button } from '@/components/ui/button'
const ExportButton = ({ targetRef, fileName = "export.png", children }) => {
  const handleExport = () => {
    if (!targetRef.current) return;
    html2canvas(targetRef.current, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
      <Button type="button" variant="outline" className="gap-2" style={{ width: "100%" , color: "black" ,textDecorationLine: "bold" }}  onClick={handleExport}>
      {children || "Export as PNG"}
    </Button>
  );
};

export default ExportButton;
