package com.journaldev.servlet;

import java.io.File;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class FileLocationContextListener implements ServletContextListener {

	public void contextInitialized(ServletContextEvent servletContextEvent) {
		ServletContext ctx = servletContextEvent.getServletContext();
		String os = System.getProperty("os.name");
		System.out.println("this is the operating system: " + os);
		String dataDir = "";
		if(os.contains("Windows")){
			dataDir =  System.getProperty("catalina.base") + File.separator + "webapps" + File.separator + ctx.getServletContextName();
		}else{
			dataDir =  "/var/lib/tomcat8/webapps" + File.separator + ctx.getServletContextName();
		}
		File file = new File(dataDir);
		if (!file.exists())
			file.mkdirs();
		ctx.setAttribute("FILES_DIR_FILE", file);
		ctx.setAttribute("FILES_DIR", dataDir);
	}

	public void contextDestroyed(ServletContextEvent servletContextEvent) {
		// do cleanup if needed
	}

}
