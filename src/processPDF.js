import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;


async function processPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let texto = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            texto += strings.join(' ') + '\n';
        }

        const extrair = (regex, texto, defaultValue = '') => {
            const match = new RegExp(regex, 'i').exec(texto);
            return match ? match[1].trim() : defaultValue;
        };

        const dados = {
            nome: extrair(/Nome:\s*(.*?)\s{2,}/, texto),
            data: extrair(/Data da Operação\s*(\d{2}\/\d{2}\/\d{4})/, texto),
            cirurgia: extrair(/Operação Tipo:\s*(.*?)\n/, texto),
            idade: extrair(/IDADE\s*(\d+)/, texto),
            prec_cp: extrair(/PRECP\s*(\d+)/, texto),
            primeiro_cirurgiao: extrair(/Operador:\s*(.*?)\n/, texto),
            segundo_cirurgiao: extrair(/1º assistente:\s*(.*?)\n/, texto),
            primeiro_aux: extrair(/2º assistente\s*(.*?)\n/, texto),
            segundo_aux: extrair(/3º assistente\s*(.*?)\n/, texto),
            // complicacao: extrair(/Acidente durante a operação:\s*(.*?)(?:\s{2,}|$)/, texto),
            // complicacao: extrair(/Acidente durante a operação:\s*(.*?)(?:\s{2,}|$)/, texto, 'Não'),
            complicacao: extrair(/Acidente durante a operação:\s*(.*?)\s+Sexo:/, texto, 'Não'),
            sexo: "",
            prontuario: "",
            estado_origem: "",
            porte_cirurgico: "",
            grupo: "",
            subespecialidade: "",
            atbprofilaxia: "",
            alta: "",
            posto: "",
            internacao: "",
            arquivo_origem: file.name || "arquivo.pdf",
            data_processamento: new Date().toLocaleString('pt-BR')
        };

        return { success: true, data: dados, rawText: texto };

    } catch (error) {
        return { success: false, error: error.message };
    }
}

export default processPDF;
