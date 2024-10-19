import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress, FormControl,
  Grid, InputLabel, MenuItem, Select,
  Tab,
  TextField
} from "@mui/material"
import { useFormik } from "formik";
import { useState, ReactElement } from "react";
import { FormContainer } from "../../components/layout/FormContainer";
import { useApi } from "../../hooks/useApi";
import useNotification from "../../hooks/useNotification";
import { Dataset } from "../../types/datasets";
import * as yup from 'yup';
import { fieldProps } from "../../utils/forms";


export const DatasetCreateForm = (props: {
  onClose: (created: boolean) => void;
}) => {
  const [ mode, setMode ] = useState('existing');
  const [ modeUrl, setModeUrl ] = useState('raw');
  const [ modeUrlItem, setModeUrlItem ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const { sendNotification } = useNotification();
  const {
    onClose,
  } = props;


  const validationSchema = yup.object({});

  const apiClient = useApi();
  const formik = useFormik({
    initialValues: {
      name: "" as string,
      description: "" as string,
      database: '' as string,
      source: '' as string,
      sparql: '' as string,
      search_mode: 'LOCAL' as string,
      files: [] as any,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (mode === 'urls') {
        if (modeUrl === 'wikidata') {
          let prefix = '';
          if (modeUrlItem === 'entity') {
            prefix = 'Q';
          } else if (modeUrlItem === 'property') {
            prefix = 'P';
          } else {
            sendNotification({ variant: "error", message: "Select the type of WikiData item to query" });
            return;
          }
          if (!values.source.startsWith('http')) {
            values.source = "https://www.wikidata.org/wiki/Special:EntityData?id=" + prefix + values.source + "&format=rdf";
          }
        }
      }

      setLoading(true);
      try {
        let result;
        if (mode === 'upload') {
          const formData = new FormData();
          formData.append('name', values.name);
          formData.append('description', values.description);
          formData.append('source', JSON.stringify({ source_type: mode }));
          for (let i = 0; i < values.files.length; i++) {
            formData.append('files', values.files[i]);
          }
          formData.append('search_mode', values.search_mode);
          formData.append('mode', 'LOCAL');
          result = await apiClient.post<Dataset>('/datasets/', formData);
        } else {
          const source = mode === 'existing' ? {
            source_type: 'existing',
            database: values.database,
          } : mode === 'urls' ? {
            source_type: 'urls',
            urls: values.source.split(/\r|\n/),
          } : {
            source_type: 'sparql',
            sparql: values.sparql,
          };

          result = await apiClient.post<Dataset>('/datasets/', {
            name: values.name,
            description: values.description,
            source,
            search_mode: values.search_mode,
            mode: mode === 'sparql' ? 'SPARQL' : 'LOCAL',
          });
        }

        if (result) {
          if (result.status === 201) {
            sendNotification({ variant: "success", message: "Dataset scheduled for creation" });
            onClose(true);
          } else {
            sendNotification({ variant: "error", message: "Error creating dataset" });
          }
        }
      } catch (e) {
        console.error(e);
        sendNotification({ variant: "error", message: "Error creating dataset" });
      }

      setLoading(false);
    },
  });

  return (
    <FormContainer
      form={formik}
      loading={loading}
      actions={<>
        <Button variant="contained" type="submit">Submit</Button>
      </>}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            {...fieldProps(formik, 'name')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            variant="outlined"
            multiline
            fullWidth
            {...fieldProps(formik, 'description')}
          />
        </Grid>
        <Grid item xs={12}>
          <TabContext value={mode}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(e, v) => setMode(v)} centered>
                <Tab label="Existing" value="existing"/>
                <Tab label="Import URL(s)" value="urls"/>
                <Tab label="SPARQL Endpoint" value="sparql"/>
                <Tab label="Import file" value="upload"/>
              </TabList>
            </Box>
            <TabPanel value="existing">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Database"
                    variant="outlined"
                    fullWidth
                    {...fieldProps(formik, 'database')}
                  />
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="urls">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TabContext value={modeUrl}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                      <TabList onChange={(e, v) => setModeUrl(v)} centered>
                        <Tab label="Custom URL" value="raw"/>
                        <Tab label="WikiData" value="wikidata"/>
                      </TabList>
                    </Box>
                    <TabPanel value="raw">
                      <TextField
                        label="URL(s) to dataset"
                        placeholder="Urls separated by newline"
                        variant="outlined"
                        multiline
                        rows={3}
                        fullWidth
                        {...fieldProps(formik, 'source')}
                      />
                    </TabPanel>
                    <TabPanel value="wikidata">
                      <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1em">
                        Select the type of item to import:
                        <Select
                          defaultValue=""
                          placeholder="Select an option"
                          value={modeUrlItem}
                          onChange={(event, newValue: ReactElement) => setModeUrlItem(newValue.props.value)}>
                          {[['entity', 'entity (Qid)'], ['property', 'property (Pid)']].map((option, index) => (
                            <MenuItem key={index} value={option[0]}>
                              {option[1]}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <TextField
                        label={modeUrlItem}
                        placeholder="write the identifier number here"
                        variant="outlined"
                        multiline
                        rows={3}
                        fullWidth
                        {...fieldProps(formik, 'source')}
                      />
                    </TabPanel>
                  </TabContext>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value="sparql">
              <Grid item xs={12}>
                <TextField
                  label="SPARQL Endpoint URL"
                  variant="outlined"
                  fullWidth
                  {...fieldProps(formik, 'sparql')}
                />
              </Grid>
            </TabPanel>
            <TabPanel value="upload">
              <Grid item xs={12}>
                <Button variant="contained" component="label">
                  Upload RDF file(s)
                  <input
                    hidden
                    accept=".rdf,.xml,.rdfxml,.owl,.ttl,.turtle,.trig,.trix,.nt,.nq,.json,.ld,.jsonld,.sms,.zip,.gz,.bz2"
                    multiple
                    type="file"
                    onChange={(e) => formik.setFieldValue('files', e.target.files)}
                  />
                </Button>
              </Grid>
            </TabPanel>
          </TabContext>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="search_mode_label">Search Mode</InputLabel>
            <Select labelId="search_mode_label" label="Search Mode"  {...fieldProps(formik, 'search_mode')} >
              <MenuItem value="LOCAL">Build Local Search Index</MenuItem>
              <MenuItem value='WIKIDATA'>Use WikiData API</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </FormContainer>
  )
}
