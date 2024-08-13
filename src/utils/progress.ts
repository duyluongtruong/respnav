const getCanvasSymbols = () => {
    const spentSymbol = "❎";
    const leftSymbol = "⛔";
    const symbolNum = 40;
    return { spentSymbol: spentSymbol, leftSymbol: leftSymbol, titleSymbolNum: symbolNum };
};

export function getLiftProgressCanvas (
    spentTime: number,
    leftTime: number,
    symbolNum: number,
  )  {
    const { spentSymbol, leftSymbol, titleSymbolNum } = getCanvasSymbols();
    const finalSymbolNum = symbolNum <= titleSymbolNum ? titleSymbolNum : symbolNum;
  
    const canvas =
      spentSymbol.repeat(Math.floor((spentTime / (spentTime + leftTime)) * finalSymbolNum)) +
      leftSymbol.repeat(finalSymbolNum - Math.floor((spentTime / (spentTime + leftTime)) * finalSymbolNum));
    const text = "✅" + ((spentTime / (spentTime + leftTime)) * 100).toFixed(0) + "%";
    return { canvas: canvas, text: text };
  };