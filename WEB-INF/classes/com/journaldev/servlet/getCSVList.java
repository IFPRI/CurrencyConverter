package com.journaldev.servlet;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import org.apache.commons.io.FileUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

@WebServlet("/getCSVList")
public class getCSVList extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private ServletFileUpload uploader = null;
	
	@Override
	public void init() throws ServletException {
		DiskFileItemFactory fileFactory = new DiskFileItemFactory();
		File filesDir = (File) getServletContext().getAttribute("FILES_DIR_FILE");
		fileFactory.setRepository(filesDir);
		this.uploader = new ServletFileUpload(fileFactory);
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
		response.setContentType("text/xml;charset=UTF-8");
		PrintWriter out = response.getWriter();

		String[] fileExt = {"csv"};
		File filesDir = new File(request.getServletContext().getAttribute("FILES_DIR").toString() + "/csv/");

		if( !filesDir.exists() ){
			filesDir.mkdirs();
		}
		List<File> filelist = (List<File>) FileUtils.listFiles(filesDir, fileExt, true);
		out.write("<response>");
		for (File file : filelist) {
			if(!file.getName().equalsIgnoreCase("currency.csv")){
				out.write("<csv>" + file.getName() + "</csv>\n");
			}
		}
		out.write("</response>");
	}

}
