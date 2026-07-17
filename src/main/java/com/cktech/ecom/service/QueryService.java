package com.cktech.ecom.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Service
public class QueryService {
    private static final Logger LOG = LoggerFactory.getLogger(QueryService.class);
    private static final String QUERIES_FILE_PATH = "config/assets/queries.xml";

    private final Map<String, String> queryCache = new HashMap<>();
    private long lastModified = 0;

    private synchronized void loadQueries() {
        File file = new File(QUERIES_FILE_PATH);
        if (!file.exists()) {
            LOG.warn("Queries file not found at: {}", file.getAbsolutePath());
            return;
        }

        if (file.lastModified() <= lastModified) {
            return;
        }

        try {
            LOG.info("Loading queries from: {}", file.getAbsolutePath());
            DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
            dbFactory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            dbFactory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
            Document doc = dBuilder.parse(file);
            doc.getDocumentElement().normalize();

            NodeList list = doc.getElementsByTagName("query");
            queryCache.clear();
            for (int i = 0; i < list.getLength(); i++) {
                Element element = (Element) list.item(i);
                String name = element.getAttribute("name");
                String queryText = element.getTextContent().trim();
                queryCache.put(name, queryText);
            }
            lastModified = file.lastModified();
        } catch (Exception e) {
            LOG.error("Failed to parse queries.xml", e);
        }
    }

    public String getQuery(String queryName) {
        loadQueries();
        String query = queryCache.get(queryName);
        if (query == null) {
            throw new IllegalArgumentException("Query not found: " + queryName);
        }
        return query;
    }

    public String formLimit(Map<String, Object> inputs) {
        if (inputs == null) {
            return "";
        }
        Object limitObj = inputs.get("limit");
        Object limitFromObj = inputs.get("limitFrom");
        if (limitObj != null) {
            try {
                int limit = Double.valueOf(limitObj.toString()).intValue();
                int limitFrom = limitFromObj != null ? Double.valueOf(limitFromObj.toString()).intValue() : 0;
                return " LIMIT " + limitFrom + ", " + limit;
            } catch (NumberFormatException e) {
                LOG.warn("Invalid limit or limitFrom values", e);
            }
        }
        return "";
    }
}
