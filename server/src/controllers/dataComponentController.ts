import { Request, Response } from 'express';
import { readData, writeData } from '../utils/readWriteData.js';

export const DataComponentController = {
    getComponentsByContractId: async (req: Request, res: Response) => {
        try {
            const { contract_config_id } = req.params; 

            const dataReaders = await readData('dataReader');
            const dataWriters = await readData('dataWriter');

            const filteredDRs = dataReaders.filter((dr: any) => dr.contract_config_id === contract_config_id);
            const filteredDWs = dataWriters.filter((dw: any) => dw.contract_config_id === contract_config_id);

            res.json({
                dataReaders: filteredDRs,
                dataWriters: filteredDWs
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching Data Components' });
        }
    },

    updateConfig: async (req: Request, res: Response) => {
        try {
            const { component_type, component_id } = req.params;
            const { message_count, message_frequency_hz } = req.body;
            
            const fileName = component_type === 'DR' ? 'dataReader' : 'dataWriter';
            const idField = component_type === 'DR' ? 'data_reader_id' : 'data_writer_id';
            
            const components = await readData(fileName);
            const index = components.findIndex((comp: any) => comp[idField] === component_id);
            
            if (index !== -1) {
                components[index].message_count = message_count;
                components[index].message_frequency_hz = message_frequency_hz;
                
                await writeData(fileName, components);
                res.json(components[index]);
            } else {
                res.status(404).json({ message: `Data ${component_type} not found` });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error updating Data Component' });
        }
    }
};