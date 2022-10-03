require 'socket'

server = TCPServer.new 3000

FILES = {
  '/demo.gif' => include_str!('demo.gif'),
  '/icon.svg' => include_str!('icon.svg'),
  '/index.html' => include_str!('index.html'),
  '/main.js' => include_str!('main.js'),
  '/typesafe.css' => include_str!('typesafe.css'),
  '/specs/directory_node.js' => include_str!('specs/directory_node.js'),
  '/specs/error_message_node.js' => include_str!('specs/error_message_node.js'),
  '/specs/file_node.js' => include_str!('specs/file_node.js'),
  '/specs/index.html' => include_str!('specs/index.html'),
  '/specs/node.js' => include_str!('specs/node.js'),
  '/specs/specs.js' => include_str!('specs/specs.js'),
  '/specs/tree-view.css' => include_str!('specs/tree-view.css'),
  '/specs/tree_view.js' => include_str!('specs/tree_view.js'),
}

CONTENT_TYPES = {
  'css' => 'text/css',
  'gif' => 'image/gif',
  'html' => 'text/html',
  'js' => 'text/javascript',
  'json' => 'application/json',
  'svg' => 'image/svg+xml'
}

pids = (1..10).map do
  fork do
    loop do
      client = server.accept
      line = client.gets
      next unless line
      method, request_target, _http_version = line.strip.split
      headers = {}
      until (line = client.gets) =~ /^\r?\n$/
        name, value = line.strip.split(': ')
        headers[name] = value
      end
      if method.upcase == 'GET'
        request_target = '/index.html' if request_target == '/'
        request_target = '/specs/index.html' if request_target == '/specs'
        if (content = FILES[request_target])
          extension = request_target.split('.').last
          content_type = CONTENT_TYPES.fetch(extension, 'text/plain')
          client.write "HTTP/1.1 200\r\n"
          client.write "Content-Type: #{content_type}\r\n"
          client.write "\r\n"
          client.write content
          p([method, request_target, 200])
        elsif request_target == '/stats/stats.json' || request_target == '/stats/current.json'
          extension = request_target.split('.').last
          content_type = CONTENT_TYPES.fetch(extension, 'text/plain')
          client.write "HTTP/1.1 200\r\n"
          client.write "Content-Type: #{content_type}\r\n"
          client.write "\r\n"
          client.write File.read(File.join(__dir__, request_target))
          p([method, request_target, 200])
        else
          client.write "HTTP/1.1 404\r\n"
          client.write "\r\n"
          client.write "resource not found\r\n"
          p([method, request_target, 404])
        end
      else
        client.write "HTTP/1.1 405\r\n"
        client.write "\r\n"
        client.write "method not allowed\r\n"
        p([method, request_target, 405])
      end
    rescue StandardError => e
      p([e.class.name, e.message, e.backtrace[0..10]])
    ensure
      client.close
    end
  end
end

puts 'server started'

pids.map { |pid| Process.wait(pid) }
