package com.journaldev.servlet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.text.ParseException;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

@WebServlet("/UploadDownloadFileServlet")
public class UploadDownloadFileServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private ServletFileUpload uploader = null;

	@Override
	public void init() throws ServletException {
		DiskFileItemFactory fileFactory = new DiskFileItemFactory();
		File filesDir = (File) getServletContext().getAttribute("FILES_DIR_FILE");
		fileFactory.setRepository(filesDir);
		this.uploader = new ServletFileUpload(fileFactory);
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String fileName = request.getParameter("fileName");
		if (fileName == null || fileName.equals("")) {
			throw new ServletException("File Name can't be null or empty");
		}
		File file = new File(request.getServletContext().getAttribute("FILES_DIR") + File.separator + fileName);
		if (!file.exists()) {
			throw new ServletException("File doesn't exists on server.");
		}
		System.out.println("File location on server::" + file.getAbsolutePath());
		ServletContext ctx = getServletContext();
		InputStream fis = new FileInputStream(file);
		String mimeType = ctx.getMimeType(file.getAbsolutePath());
		response.setContentType(mimeType != null ? mimeType : "application/octet-stream");
		response.setContentLength((int) file.length());
		response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

		ServletOutputStream os = response.getOutputStream();
		byte[] bufferData = new byte[1024];
		int read = 0;
		while ((read = fis.read(bufferData)) != -1) {
			os.write(bufferData, 0, read);
		}
		os.flush();
		os.close();
		fis.close();
		System.out.println("File downloaded at client successfully");
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		if (!ServletFileUpload.isMultipartContent(request)) {
			throw new ServletException("Content type is not multipart/form-data");
		}

		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		out.write("<html><head><link rel='stylesheet' href='css/success.css'></head><body>");
		try {
			List<FileItem> fileItemsList = uploader.parseRequest(request);
			Iterator<FileItem> fileItemsIterator = fileItemsList.iterator();
			
			FileItem fileItem = fileItemsIterator.next();
			fileItem = fileItemsIterator.next();

			String date = getCSVDate( fileItem );
			File file = new File(request.getServletContext().getAttribute("FILES_DIR") + File.separator + "csv" + File.separator + "currency_" + date + ".csv");
			
			if( file.exists() ){
				file.delete();
			}
			fileItem.write(file);

			out.write("<div id='successfulUpload'>");
			out.write("File " + "currency_" + date + ".csv" + " uploaded successfully.");
			
			String scheme = request.getScheme();
			String serverName = request.getServerName();
			int serverPort = request.getServerPort();
			String contextPath = request.getContextPath();
			String resultPath = scheme + "://" + serverName + ":" + serverPort + contextPath;
			
			out.write("<script> setTimeout(function(){location.href='" + resultPath + "/'} , 2000)</script>");
			out.write("</div>");
			
		} catch (FileUploadException e) {
			out.write("Exception in uploading file.");
			out.write("\n" + e.getMessage());
		} catch (Exception e) {
			out.write("Exception in uploading file.");
			out.write("\n" + e.getMessage());
		}
		out.write("</body></html>");
	}

	private String getCSVDate( FileItem fileItem ) throws ParseException {
		String fileContent = fileItem.getString();
		String[] tokens = fileContent.split(",");
		String dateFound = "1.4.2017";
		for (int i = 0; i < tokens.length; i++) {
				String ch = "/";
				if ( tokens[i].indexOf( ch ) > 0) {
					return tokens[i].replace("/", ".");
				}
		}
		return dateFound;
	}



}
