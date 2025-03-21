type Props = {
  fileType: "pdf" | "html" | "null";
  content: string;
};

export const ReaderByType = ({ fileType, content }: Props) => {
  const sanitizeHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const imgs = doc.querySelectorAll("img");
    imgs.forEach((img) => img.remove());

    let meta = doc.querySelector("meta[name='viewport']") as HTMLMetaElement;
    if (!meta) {
      meta = doc.createElement("meta") as HTMLMetaElement;
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      doc.head.appendChild(meta);
    }

    const style = doc.createElement("style");
    style.innerHTML = `
      body {
        background-color: #FBF1EA;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0;
        overflow: hidden;
      }
      p {
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        white-space: pre-wrap;
      }
    `;
    doc.head.appendChild(style);

    return doc.body.innerHTML;
  };

  const renderPdf = () => {
    const pdfUrl = `data:application/pdf;base64,${content}#toolbar=0`;
    return (
      <iframe
        src={pdfUrl}
        width="100%"
        height="1000px"
        title="PDF Viewer"
        style={{ display: "block", border: "none" }}
      />
    );
  };

  const reader = {
    html: <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />,
    pdf: renderPdf(),
    null: <div> {content}</div>,
  };

  return <div>{reader[fileType]}</div>;
};
