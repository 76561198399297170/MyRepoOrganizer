# 学习记录

## 第一节

### 回顾与引言

在前面的项目中，无论是游戏局内逻辑还是主菜单逻辑，以及动画封装各种累都放在了main.cpp下，全部代码写在一个文件下就会显得文件很臃肿，不仅会导致命名空间和依赖关系混乱，在调试修改时也不容易定位代码位置。所以首先我们需要将项目不同阶段代码放置到不同类中封装，并将不同的类封装到不同头文件与源文件中。

在割草游戏项目的最后，我们可以优化场景类型定义Stage枚举类区分不同游戏阶段，随后根据不同阶段进行不同的事件处理和绘图逻辑（有点像状态机呢），这就类似最原始的场景管理思想了。

什么是场景？假设程序项目是一场演出，演出过程中又又不同的幕，在不同幕中又有不同“剧本”的逻辑和“角色”，其中的“角色”就是游戏开发中经常提到的GameObject，无论是玩家敌人还是子弹从概念上都是GameObject的范畴，接收不同场景“剧情”的指挥，以上便可以对项目场景从宏观上进行简单划分了：

首先是主菜单为一个场景，随后选择界面又是一个场景，最后游戏局内逻辑也需要在一个单独场景中进行。

所以我们可以定义场景基类Scene，而以上三个场景继承这个基类场景，通过多态实现不同场景逻辑，回顾之前的内容，项目的主体循环使用while先进行读取操作，处理数据，绘制画面最后动态延时的方法，在结束循环后释放资源，也就是：

```
#include <graphics.h>

const int FPS = 60;

int main()
{
	ExMessage msg;

	initgraph(1200, 720, EW_SHOWCONSOLE);

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			//读取操作
		}
		//更新数据

		cleardevice();
		//绘制图像

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```



### 文件包含与基类场景接口

为了完成上面Scene场景类的封装和实践，我们创建scene.h文件，此时生成的文件仅有一行#pragma once表示防止重复包含头文件：

include操作即纯粹的将包含文件代码复制粘贴到include的位置，而比如a.h和b.h都包含了c.h，最后main.cpp包含a.h和b.h就会导致c.h重复包含两次报错，为了防止所以使用这一行代码防止重复包含。

除了#pragma once还可以使用if not define指令进行包含，如果未定义宏就进行定义并包含代码文件，反之不进行任何操作：

```
#ifndef _SCENE_H_
#define _SCENE_H_

#endif
```



完成基类Scene的创建与部分逻辑如下，注意多态要使用virtual虚函数修饰，提供场景进入与退出的初始化逻辑，以及各个循环过程中的逻辑：

```
#ifndef _SCENE_H_
#define _SCENE_H_

#include <graphics.h>

class Scene
{
public:
	Scene() = default;
	~Scene() = default;

	virtual void on_enter() {}
	virtual void on_update() {}
	virtual void on_draw() {}
	virtual void on_input(const ExMessage& msg) {}
	virtual void on_exit() {}

private:

};

#endif
```



以上就类似于场景的模板，所有场景需要继承Scene基类实现虚函数内容即可实现不同场景的不同逻辑部分。

### 场景类具体实例化

接下来开始实现第一个用于实例化的场景子类主菜单场景类，创建头文件menuScene.h使用宏防止重复包含并引入scene.h头文件并使MenuScene继承Scene并重写主菜单对应逻辑方法，为方便测试，当前仅对各部分实现控制台打印文字的效果：

```
#ifndef _MENU_SCENE_H_
#define _MENU_SCENE_H_

#include "scene.h"

#include <iostream>

class MenuScene : public Scene
{
public:
	MenuScene() = default;
	~MenuScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入主菜单！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "主菜单运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"主菜单绘制");
	}

	virtual void on_input(const ExMessage& msg) {}

	virtual void on_exit()
	{
		std::cout << "主菜单退出！" << std::endl;
	}

private:

};

#endif
```



回到main.cpp中着手实例化菜单场景，引入对应头文件，主循环外new创建菜单场景对象，

```
//包含头文件
#include "scene.h"
#include "menuScene.h"

//主循环while之前创建菜单场景对象
Scene* scene = new MenuScene();
scene->on_enter();

//读取操作
scene->on_input(msg);

//更新数据
scene->on_updata();

//绘制图像
scene->on_draw();

```



运行即可看到提示词，接下来开始编写游戏场景类，创建头文件gameScene.h头文件，并类比menuScene.h实现对应功能：

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "scene.h"

#include <iostream>

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入游戏局内场景！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "游戏运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"游戏局内绘制");
	}

	virtual void on_input(const ExMessage& msg) {}

	virtual void on_exit()
	{
		std::cout << "游戏局内退出！" << std::endl;
	}

private:

};

#endif
```



接下来考虑场景之间跳转功能，类比舞台剧，不同幕布间的切换需要一位导演记录与管理幕布的切换动作，在程序中，我们称其为场景管理器！

虽然如此多代码与游戏逻辑无关，但这就是大多数人初学时容易忽略的架构意识，如果一个程序在开发初期就没有从分析功能入手设计良好的程序结构，随着功能开发的推进代码间逻辑就会越来越混乱，添加新功能时无从下手之后出现了问题还不容易测试。

## 第一节代码完整展示

**main.cpp**

```
#include "scene.h"
#include "menuScene.h"

#include <graphics.h>

const int FPS = 60;

int main()
{
	ExMessage msg;

	initgraph(1200, 720);

	Scene* scene = new MenuScene();
	scene->on_enter();

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene->on_input(msg);
		}
		scene->on_update();

		cleardevice();
		scene->on_draw();

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```

**scene.h**

```
#ifndef _SCENE_H_
#define _SCENE_H_

#include <graphics.h>

class Scene
{
public:
	Scene() = default;
	~Scene() = default;

	virtual void on_enter() {}
	virtual void on_update() {}
	virtual void on_draw() {}
	virtual void on_input(const ExMessage& msg) {}
	virtual void on_exit() {}

private:

};

#endif
```

**menuScene.h**

```
#ifndef _MENU_SCENE_H_
#define _MENU_SCENE_H_

#include "scene.h"

#include <iostream>

class MenuScene : public Scene
{
public:
	MenuScene() = default;
	~MenuScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入主菜单！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "主菜单运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"主菜单绘制");
	}

	virtual void on_input(const ExMessage& msg) {}

	virtual void on_exit()
	{
		std::cout << "主菜单退出！" << std::endl;
	}

private:

};

#endif
```

**gameScene.h**

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "scene.h"

#include <iostream>

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入游戏局内场景！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "游戏运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"游戏局内绘制");
	}

	virtual void on_input(const ExMessage& msg) {}

	virtual void on_exit()
	{
		std::cout << "游戏局内退出！" << std::endl;
	}

private:

};

#endif
```



## 第二节

### 场景管理器

项目程序实际上就是一个大大的循环，同时也是一个状态机，而运行过程中的场景就是一幕幕状态，管理这些场景的状态机就是场景管理器。

类比其他类，接下来将场景管理器封装为SceneManager创建于sceneManager.h文件下，场景管理器实际上是对场景切换，就像是一台状态机，从菜单界面到选人界面到游戏界面再到菜单界面，每个界面就是一个状态。

所以类内创建枚举类，SceneType并提供setCurrentState设置当前状态，注意进入场景调用on_enter方法确保场景执行完整，以及switchTo方法执行场景间跳转：

```
#ifndef _SCENE_MANAGER_H_
#define _SCENE_MANAGER_H_

#include "scene.h"

class SceneManager
{
public:
	enum class SceneType
	{
		Menu,
		Game
	};

public:
	SceneManager() = default;
	~SceneManager() = default;

	void setCurrentState(Scene* scene)
	{
		this->m_current_scene = scene;
		this->m_current_scene->on_enter();
	}

	void switchTo(SceneType type)
	{
		this->m_current_scene->on_exit();
		switch (type)
		{
		case SceneManager::SceneType::Menu:
			break;
		case SceneManager::SceneType::Game:
			break;
		default:
			break;
		}
		this->m_current_scene->on_enter();
	}

public:
	Scene* m_current_scene = nullptr;

};

#endif
```



这里的on_enter和on_exit类似析构函数与构造函数，但是构造函数与析构函数同在决定这场景对象在内存中的生命周期，大项目中不断析构与构造花费大量时间重复进行创建与销毁是不友好的，不同场景间资源也会存在相互引用也就是场景内对象生命周期长于场景对对象本身生命周期的情况，这对内存管理提出了更高要求。

这里就是一个简单的方法，就是将场景对象生命周期与程序生命周期相同，也就是程序运行时创建初始化所有场景对象结束时释放所有场景对象，所以这里避免了析构与构造函数转而提供语义明确的on_enter与on_exit方法并在其中尽可能避免释放资源而是重置其状态。

例如当游戏局内场景中玩家类生命值归零回到主菜单时，原本情况下我们应该调用其析构函数释放资源在重新进入游戏局内时再创建新的玩家类，但是现在我们只需要在on_enter时重置玩家类状态即可。

接下来在main.cpp中创建场景类全局指针，并且在初始化阶段创建实例化：

```
//全局区
Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;

//初始化
menu_scene = new MenuScene();
game_scene = new GameScene();
```



随后在sceneManager.h中通过extern关键字获取到这两个全局指针引用，并将sceneManager成员函数switchTo中跳转方法补全，修改成员函数setCurrentState更名为setCurrentScene，补全成员函数on_input与on_updata与on_draw方法，目前只需要做简单的传递即可：

```
//全局区
extern Scene* menu_scene;
extern Scene* game_scene;

//sceneManager成员函数switchTo中
switch (type)
{
case SceneManager::SceneType::Menu:
	this->m_current_scene = menu_scene;
	break;
case SceneManager::SceneType::Game:
	this->m_current_scene = game_scene;
	break;
default:
	break;
}

//成员函数补齐
void on_updata()
{
    this->m_current_scene->on_update();
}

void on_draw()
{
    this->m_current_scene->on_draw();
}

void on_input(const ExMessage& msg)
{
    this->m_current_scene->on_input(msg);
}
```



为什么场景跳转使用枚举类作为参数而设置跳转则使用场景指针？原因是设置当前场景的方法通常只在启动时初始化，设置场景管理器入口场景时才被调用，与子场景实例化几乎同时进行所以使用指针会更方便，跳转场景基本在不同场景内部更新时被调用，场景间持有彼此引用是一种不太优雅且极其任意出现内存问题的行为，所以使用枚举类来屏蔽掉管理器内部指针操作。

随后在main.cpp中引入sceneManager.h头文件并在全局区声明实例化场景管理器删除mian中之前测试的scene变量，并在初始化设置场景管理器入口场景为menu_scene主菜单场景（注意先后顺序），并在主循环中替换scene的方法：

```
//全局区
SceneManager scene_manager;

//初始化设置入口场景
scene_manager.setCurrentState(menu_scene);

//主循环框架的调用
while (peekmessage(&msg))
{
	scene_manager.on_input(msg);
}
scene_manager.on_updata();

cleardevice();
scene_manager.on_draw();

FlushBatchDraw();
```



接下来便是具体场景间的跳转功能代码了，首先在menuScene.h中引入sceneManager.h头文件并使用extern声明外部的scene_manager对象，若我们希望在主菜单界面按下任意键跳转到Game场景则编写如下代码，并在gameScene.h中编写相似代码，运行程序即可在程序中按任何键在两个界面中来回切换了：

```
//menuScene.h全局区
#include "sceneManager.h"

extern SceneManager scene_manager;

//MenuScene成员函数on_input中
virtual void on_input(const ExMessage& msg)
{
    if (msg.message == WM_KEYDOWN)
    {
        scene_manager.switchTo(SceneManager::SceneType::Game);
    }
}

//gameScene.h全局区
#include "sceneManager.h"

extern SceneManager scene_manager;

//GameScene成员函数on_input中
virtual void on_input(const ExMessage& msg)
{
    if (msg.message == WM_KEYDOWN)
    {
        scene_manager.switchTo(SceneManager::SceneType::Menu);
    }
}
```



正如之前规划的还需要一个选人界面，所以定义selectorScene.h文件并实例化SelectorScene继承Scene基类编写类似代码，并注意在main.cpp中创建并初始化，在sceneManager.h中extern声明并修改枚举类与switchTo，以及修改各个场景间on_input的各场景间切换：

```
//selectorScene.h文件代码
#ifndef _SELECTOR_SCENE_H_
#define _SELECTOR_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern SceneManager scene_manager;

class SelectorScene : public Scene
{
public:
	SelectorScene() = default;
	~SelectorScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入选人！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "选人运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"选人绘制");
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			scene_manager.switchTo(SceneManager::SceneType::Menu);
		}
	}

	virtual void on_exit()
	{
		std::cout << "选人退出！" << std::endl;
	}

private:

};

#endif

//main.cpp全局声明
#include "selectorScene.h"
Scene* selector_scene = nullptr;

//main.cpp主循环中初始化
selector_scene = new SelectorScene();

//sceneManager.h文件中全局声明并修改枚举类与成员函数switchTo
extern Scene* selector_scene;//全局声明

//成员枚举类
enum class SceneType
{
    Menu,
    Game,
    Selector
};

//成员函数switchTo的switch(type)跳转中添加
case SceneManager::SceneType::Selector:
    this->m_current_scene = selector_scene;
    break;


//menuScene.h成员函数on_input修改
scene_manager.switchTo(SceneManager::SceneType::Selector);

//gameScene.h成员函数on_input修改
scene_manager.switchTo(SceneManager::SceneType::Menu);
```



运行程序，按下任意键即可执行由Menu->Selector->Game->Menu...的场景跳转了，我们也可以在visual studio的左侧解决方案添加筛选器Scene并将场景文件添加到其中，添加筛选器Manager将管理器添加到其中既美观又一目了然方便管理。

### 资源加载

接下来是资源加载部分，在此之前先回顾之前的资源加载中的动画相关概念，在程序中我们通过快速切换一系列图片通过人眼的视觉留影实现动画效果，为了方便资源管理和可复用性，我们设计了Atlas图集类和Animation动画类，Atlas作为有相关性一系列图片的资源管理容器，而Animation作为觉得实际渲染图集的轻量控制器。

首先从atlas.h头文件开始创建Atlas类，由于整体图片资源名称规律，所以提供loadFromFile方法使用模板加载图片资源，以及clear方法，getSize方法，getImage方法，addImage方法，对于图片翻转等功能帮助较大：

```
#ifndef _ATLAS_H_
#define _ATLAS_H_

#include <vector>
#include <graphics.h>

class Atlas 
{
public:
	Atlas() = default;
	~Atlas() = default;

	void loadFromFile(LPCTSTR path_template, int num)
	{
		this->m_img_list.clear();
		this->m_img_list.resize(num);

		TCHAR path_file[256];
		for (int i = 0; i < num; i++)
		{
			_stprintf_s(path_file, path_template, i + 1);
			loadimage(&this->m_img_list[i], path_file);
		}
	}

	void clear()
	{
		this->m_img_list.clear();
	}

	int getSize()
	{
		return this->m_img_list.size();
	}

	IMAGE* getImage(int idx)
	{
		if (idx < 0 || idx >= this->m_img_list.size()) return nullptr;

		return &this->m_img_list[idx];
	}

	void addImage(const IMAGE& img)
	{
		this->m_img_list.push_back(img);
	}

private:
	std::vector<IMAGE> m_img_list;

};

#endif
/*
本段注释不包含在文件内。
若需要加载根目录img文件下的img_1.png，img_2.png，img_3.png，img_4.png图集可以编写如下的代码：
Atlas atlas;
atlas.loadFromFile(L"./img/img_%d.png", 4);
*/
```



底层的Atlas代码以及完成，而Animation类都是在Atlas上进行实现的，动画效果还需待Animation类完成，同时动画的更新与渲染也对现有的场景架构提出了新的要求。

## 第二节代码完成展示

**main.cpp**

```
#include "scene.h"
#include "menuScene.h"
#include "gameScene.h"
#include "selectorScene.h"
#include "sceneManager.h"

#include <graphics.h>

const int FPS = 60;

Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;
Scene* selector_scene = nullptr;

SceneManager scene_manager;

int main()
{
	ExMessage msg;

	initgraph(1200, 720);
	
	menu_scene = new MenuScene();
	game_scene = new GameScene();
	selector_scene = new SelectorScene();
	scene_manager.setCurrentState(menu_scene);

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene_manager.on_input(msg);
		}
		scene_manager.on_updata();

		cleardevice();
		scene_manager.on_draw();

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```

**atlas.h**

```
#ifndef _ATLAS_H_
#define _ATLAS_H_

#include <vector>
#include <graphics.h>

class Atlas 
{
public:
	Atlas() = default;
	~Atlas() = default;

	void loadFromFile(LPCTSTR path_template, int num)
	{
		this->m_img_list.clear();
		this->m_img_list.resize(num);

		TCHAR path_file[256];
		for (int i = 0; i < num; i++)
		{
			_stprintf_s(path_file, path_template, i + 1);
			loadimage(&this->m_img_list[i], path_file);
		}
	}

	void clear()
	{
		this->m_img_list.clear();
	}

	int getSize()
	{
		return this->m_img_list.size();
	}

	IMAGE* getImage(int idx)
	{
		if (idx < 0 || idx >= this->m_img_list.size()) return nullptr;

		return &this->m_img_list[idx];
	}

	void addImage(const IMAGE& img)
	{
		this->m_img_list.push_back(img);
	}

private:
	std::vector<IMAGE> m_img_list;

};

#endif
```

**gameScene.h**

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern SceneManager scene_manager;

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入游戏局内场景！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "游戏运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"游戏局内绘制");
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			scene_manager.switchTo(SceneManager::SceneType::Menu);
		}
	}

	virtual void on_exit()
	{
		std::cout << "游戏局内退出！" << std::endl;
	}

private:

};

#endif
```

**menuScene.h**

```
#ifndef _MENU_SCENE_H_
#define _MENU_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern SceneManager scene_manager;

class MenuScene : public Scene
{
public:
	MenuScene() = default;
	~MenuScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入主菜单！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "主菜单运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"主菜单绘制");
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			scene_manager.switchTo(SceneManager::SceneType::Selector);
		}
	}

	virtual void on_exit()
	{
		std::cout << "主菜单退出！" << std::endl;
	}

private:

};

#endif
```

**selectorScene.h**

```
#ifndef _SELECTOR_SCENE_H_
#define _SELECTOR_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern SceneManager scene_manager;

class SelectorScene : public Scene
{
public:
	SelectorScene() = default;
	~SelectorScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入选人！" << std::endl;
	}

	virtual void on_update()
	{
		std::cout << "选人运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"选人绘制");
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			scene_manager.switchTo(SceneManager::SceneType::Game);
		}
	}

	virtual void on_exit()
	{
		std::cout << "选人退出！" << std::endl;
	}

private:

};

#endif
```

**sceneManager.h**

```
#ifndef _SCENE_MANAGER_H_
#define _SCENE_MANAGER_H_

#include "scene.h"

extern Scene* menu_scene;
extern Scene* game_scene;
extern Scene* selector_scene;

class SceneManager
{
public:
	enum class SceneType
	{
		Menu,
		Game,
		Selector
	};

public:
	SceneManager() = default;
	~SceneManager() = default;

	void setCurrentState(Scene* scene)
	{
		this->m_current_scene = scene;
		this->m_current_scene->on_enter();
	}

	void switchTo(SceneType type)
	{
		this->m_current_scene->on_exit();
		switch (type)
		{
		case SceneManager::SceneType::Menu:
			this->m_current_scene = menu_scene;
			break;
		case SceneManager::SceneType::Game:
			this->m_current_scene = game_scene;
			break;
		case SceneManager::SceneType::Selector:
			this->m_current_scene = selector_scene;
			break;
		default:
			break;
		}
		this->m_current_scene->on_enter();
	}

	void on_updata()
	{
		this->m_current_scene->on_update();
	}

	void on_draw()
	{
		this->m_current_scene->on_draw();
	}

	void on_input(const ExMessage& msg)
	{
		this->m_current_scene->on_input(msg);
	}

public:
	Scene* m_current_scene = nullptr;

};

#endif
```



## 第三节

### 图片翻转

大部分包括我们本次项目，角色的左右移动序列帧图像仅仅只是水平镜像的差异，所以本次项目只提供了向右序列帧的，而向左序列帧则可以通过图片像素进行动态生成，和Animation强相关的Atlas类还有一个功能未完成，就是水平翻转，图片像素翻转需要对每个像素逐个处理，是一个相对耗时的操作所以这个操作需要在游戏初始化阶段完成，思路上通过加载图集向右图片遍历每一张并将其拷到向左图集中。

首先定义一个utils.h工具类头文件，编写flipImage翻转图片函数，包含两个参数翻转目标图片与翻转结果图片，借助GetImageBuffer函数对像素进行操作：

```
#ifndef _UTILS_H_
#define _UTILS_H_

#include <graphics.h>

inline void flipImage(IMAGE* src, IMAGE* dst)
{
	int w = src->getwidth(), h = src->getheight();
	Resize(dst, w, h);
	
	DWORD* src_buffer = GetImageBuffer(src);
	DWORD* dst_buffer = GetImageBuffer(dst);
	for (int i = 0; i < h; i++)
	{
		for (int j = 0; j < w; j++)
		{
			int src_idx = i * w + j, dst_idx = (i + 1) * w - j - 1;
			dst_buffer[dst_idx] = src_buffer[src_idx];
		}
	}
	return;
}

#endif
```



接下来可以进行数据加载了，在main.cpp中引入utils.h和atlas.h，并定义图集翻转（注意这里是图集，前面的是图片）函数，首先清空目标图集防止复用时出现问题，随后原图集中每一帧图片都执行flipImage操作并提供addImage添加图集：

```
#include "atlas.h"
#include "utils.h"

void flipAtlas(Atlas& src, Atlas& dst)
{
	dst.clear();
	for (int i = 0; i < src.getSize(); i++)
	{
		IMAGE img_flpipped;
		flipImage(src.getImage(i), &img_flpipped);
		dst.addImage(img_flpipped);
	}
}
```



### 图像加载

接下来可以将素材中内容放到项目工程中的resources目录下，并在main.cpp下编写loadGameResources函数加载资源，由于本项目较小，所以为方便后续开发过程中直接使用，而非使用时跳转回来添加新的资源家啊在逻辑，目前阶段选择将整个程序所需资源全部加载。

首先是所需的图片图集变量定义在全局环境并注意起名（最好有意义并且包含未知朝向等信息），对应的在loadAGameResources函数中进行加载：

```
//因使用了mciSendString所以全局区需要包含对应库
#pragma comment(lib, "Winmm.lib")

IMAGE img_menu_background;					//主菜单背景图片

IMAGE img_VS;								//VS 艺术字图片
IMAGE img_1P;								//1P 文本图片
IMAGE img_2P;								//2P 文本图片
IMAGE img_1P_desc;							//1P 键位描述图片
IMAGE img_2P_desc;							//2P 键位描述图片
IMAGE img_select_background__left;			//选人朝左背景图片
IMAGE img_select_background_right;			//选人朝右背景图片
IMAGE img_selector_tip;						//选人界面提示信息
IMAGE img_selector_background;				//选人界面背景图
IMAGE img_1P_selector_btn_idle_left;		//1P 向左选择按钮默认状态图片
IMAGE img_1P_selector_btn_idle_right;		//1P 向右选择按钮默认状态图片
IMAGE img_1P_selector_btn_down_left;		//1P 向左选择按钮按下状态图片
IMAGE img_1P_selector_btn_down_right;		//1P 向右选择按钮按下状态图片
IMAGE img_2P_selector_btn_idle_left;		//2P 向左选择按钮默认状态图片
IMAGE img_2P_selector_btn_idle_right;		//2P 向右选择按钮默认状态图片
IMAGE img_2P_selector_btn_down_left;		//2P 向左选择按钮按下状态图片
IMAGE img_2P_selector_btn_down_right;		//2P 向右选择按钮按下状态图片
IMAGE img_gamer1_selector_background_left;	//选人界面类型1朝左背景图片
IMAGE img_gamer1_selector_background_right;	//选人界面类型1朝右北京图片
IMAGE img_gamer2_selector_background_left;	//选人界面类型2朝左背景图片
IMAGE img_gamer2_selector_background_right;	//选人界面类型2朝右北京图片

IMAGE img_sky;								//填空图片
IMAGE img_hills;							//山脉图片
IMAGE img_platform_large;					//大型平台图片
IMAGE img_platform_small;					//小型平台图片

IMAGE img_1P_cursor;						//1P 指示光标图片
IMAGE img_2P_cursor;						//2P 指示光标图片

Atlas atlas_gamer1_idle_left;				//类型1向左默认动画图集
Atlas atlas_gamer1_idle_right;				//类型1向右默认动画图集
Atlas atlas_gamer1_run_left;				//类型1向左奔跑动画图集
Atlas atlas_gamer1_run_right;				//类型1向右奔跑动画图集
Atlas atlas_gamer1_attack_ex_left;			//类型1向左特殊攻击动画图集
Atlas atlas_gamer1_attack_ex_right;			//类型1向右特殊攻击动画图集
Atlas atlas_gamer1_die_left;				//类型1向左死亡动画图集
Atlas atlas_gamer1_die_right;				//类型1向右死亡动画图集

Atlas atlas_gamer2_idle_left;				//类型2向左默认动画图集
Atlas atlas_gamer2_idle_right;				//类型2向右默认动画图集
Atlas atlas_gamer2_run_left;				//类型2向左奔跑动画图集
Atlas atlas_gamer2_run_right;				//类型2向右奔跑动画图集
Atlas atlas_gamer2_attack_ex_left;			//类型2向左特殊攻击动画图集
Atlas atlas_gamer2_attack_ex_right;			//类型2向右特殊攻击动画图集
Atlas atlas_gamer2_die_left;				//类型2向左死亡动画图集
Atlas atlas_gamer2_die_right;				//类型2向右死亡动画图集

IMAGE img_gamer1_bullet;					//类型1子弹图片
Atlas atlas_gamer1_bullet_break;			//类型1子弹破碎动画图集
Atlas atlas_gemer2_bullet;					//类型2子弹动画图集
Atlas atlas_gemer2_bullet_explode;			//类型2子弹爆炸动画图集
Atlas atlas_gamer2_bullet_ex;				//类型2特殊类型子弹动画图集
Atlas atlas_gamer2_bullet_ex_explode;		//类型2特殊类型子弹爆炸动画图集
Atlas atlas_gamer2_bullet_text;				//类型2特殊类型子弹爆炸文本动画图集

Atlas atlas_run_effect;						//奔跑特效动画图集
Atlas atlas_jump_effect;					//跳跃特效动画图集
Atlas atlas_land_effect;					//落地特效动画图集

IMAGE img_winner_bar;						//获胜玩家背景图片
IMAGE img_1P_winner;						//1P 获胜文本图片
IMAGE img_2P_winner;						//2P 获胜文本图片

IMAGE img_avatar_gamer1;					//类型1头像图片
IMAGE img_avatar_gamer2;					//类型2头像图片

void loadGameResources()
{
	AddFontResourceEx(L"./resources/HYPixel11pxU-2.ttf", FR_PRIVATE, NULL);

	loadimage(&img_menu_background, L"./resources/menu_background.png");

	loadimage(&img_VS, L"./resources/VS.png");
	loadimage(&img_1P, L"./resources/1P.png");
	loadimage(&img_2P, L"./resources/2P.png");
	loadimage(&img_1P_desc, L"./resources/1P_desc.png");
	loadimage(&img_2P_desc, L"./resources/2P_desc.png");
	loadimage(&img_select_background_right, L"./resources/select_background.png");
	flipImage(&img_select_background_right, &img_select_background_left);
	loadimage(&img_selector_tip, L"./resources/selector_tip.png");
	loadimage(&img_selector_background, L"./resources/selector_background.png");
	loadimage(&img_1P_selector_btn_idle_right, L"./resources/1P_selector_btn_idle.png");
	flipImage(&img_1P_selector_btn_idle_right, &img_1P_selector_btn_idle_left);
	loadimage(&img_1P_selector_btn_down_right, L"./resources/1P_selector_btn_down.png");
	flipImage(&img_1P_selector_btn_down_right, &img_1P_selector_btn_down_left);
	loadimage(&img_2P_selector_btn_idle_right, L"./resources/2P_selector_btn_idle.png");
	flipImage(&img_2P_selector_btn_idle_right, &img_2P_selector_btn_idle_left);
	loadimage(&img_2P_selector_btn_down_right, L"./resources/2P_selector_btn_down.png");
	flipImage(&img_2P_selector_btn_down_right, &img_2P_selector_btn_down_left);
	loadimage(&img_gamer1_selector_background_right, L"./resources/gamer1_selector_background.png");
	flipImage(&img_gamer1_selector_background_right, &img_gamer1_selector_background_left);
	loadimage(&img_gamer2_selector_background_right, L"./resources/gamer2_selector_background.png");
	flipImage(&img_gamer2_selector_background_right, &img_gamer2_selector_background_left);

	loadimage(&img_sky, L"./resources/sky.png");
	loadimage(&img_hills, L"./resources/hills.png");
	loadimage(&img_platform_large, L"./resources/platform_large.png");
	loadimage(&img_platform_small, L"./resources/platform_small.png");

	loadimage(&img_1P_cursor, L"./resources/1P_cursor.png");
	loadimage(&img_2P_cursor, L"./resources/2P_cursor.png");

	atlas_gamer1_idle_right.loadFromFile(L"./resources/gamer1_idle_%d.png", 9);
	flipAtlas(atlas_gamer1_idle_right, atlas_gamer1_idle_left);
	atlas_gamer1_run_right.loadFromFile(L"./resources/gamer1_run_%d.png", 5);
	flipAtlas(atlas_gamer1_run_right, atlas_gamer1_run_left);
	atlas_gamer1_attack_ex_right.loadFromFile(L"./resources/gamer1_attack_ex_%d.png", 3);
	flipAtlas(atlas_gamer1_attack_ex_right, atlas_gamer1_attack_ex_left);
	atlas_gamer1_die_right.loadFromFile(L"./resources/gamer1_die_%d.png", 4);
	flipAtlas(atlas_gamer1_die_right, atlas_gamer1_die_left);

	atlas_gamer2_idle_right.loadFromFile(L"./resources/gamer2_idle_%d.png", 8);
	flipAtlas(atlas_gamer2_idle_right, atlas_gamer2_idle_left);
	atlas_gamer2_run_right.loadFromFile(L"./resources/gamer2_run_%d.png", 5);
	flipAtlas(atlas_gamer2_run_right, atlas_gamer2_run_left);
	atlas_gamer2_attack_ex_right.loadFromFile(L"./resources/gamer2_attack_ex_%d.png", 9);
	flipAtlas(atlas_gamer2_attack_ex_right, atlas_gamer2_attack_ex_left);
	atlas_gamer2_die_right.loadFromFile(L"./resources/gamer2_die_%d.png", 2);
	flipAtlas(atlas_gamer2_die_right, atlas_gamer2_die_left);

	loadimage(&img_gamer1_bullet, L"./resources/gamer_bullet1.png");
	atlas_gamer1_bullet_break.loadFromFile(L"./resources/gamer1_bullet_break_%d.png", 3);
	atlas_gemer2_bullet.loadFromFile(L"./resources/gamer2_bullet_%d.png", 5);
	atlas_gemer2_bullet_explode.loadFromFile(L"./resources/gamer2_bullet_explode_%d.png", 5);
	atlas_gamer2_bullet_ex.loadFromFile(L"./resources/gamer2_bullet_ex_%d.png", 5);
	atlas_gamer2_bullet_ex_explode.loadFromFile(L"./resources/gamer2_bullet_ex_explode_%d.png", 5);
	atlas_gamer2_bullet_text.loadFromFile(L"./resources/gamer2_bullet_text_%d.png", 6);

	atlas_run_effect.loadFromFile(L"./resources/run_effect_%d.png", 4);
	atlas_jump_effect.loadFromFile(L"./resources/jump_effect_%d.png", 5);
	atlas_land_effect.loadFromFile(L"./resources/land_effect_%d.png", 2);

	loadimage(&img_1P_winner, L"./resources/1P_winner.png");
	loadimage(&img_2P_winner, L"./resources/2P_winner.png");
	loadimage(&img_winner_bar, L"./resources/winner_bar.png");

	loadimage(&img_avatar_gamer1, L"./resources/avatar_gamer1.png");
	loadimage(&img_avatar_gamer2, L"./resources/avatar_gamer2.png");

	mciSendString(L"open ./resources/bgm_game.mp3 alias bgm_game", NULL, 0, NULL);
	mciSendString(L"open ./resources/bgm_menu.mp3 alias bgm_menu", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_1.mp3 alias gamer1_bullet_break_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_2.mp3 alias gamer1_bullet_break_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_3.mp3 alias gamer1_bullet_break_3", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_1.mp3 alias gamer1_bullet_shoot_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_2.mp3 alias gamer1_bullet_shoot_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_ex.mp3 alias gamer1_bullet_shoot_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode.mp3 alias gamer2_bullet_explode", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode_ex.mp3 alias gamer2_bullet_explode_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_text.mp3 alias gamer2_bullet_text", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_confirm.wav alias ui_confirm", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_switch.wav alias ui_switch", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_win.wav alias ui_win", NULL, 0, NULL);

	return;
}

//在加载资源处注意调用该函数

```



编写代码时（除非是新手为了熟悉关键字）应当学会借助编译器代码提示工具补全变量，提高开发效率。

### 动画类实现

创建Animation.h文件以及动画类，然后依旧是考虑成员变量与成员函数，成员变量一般决定这个类的数据属性，而成员函数则是根据这些数据属性选择对外提供何种的增删改查接口。

正如开始的设计数量动画类必然需要持有图集Atlas引用，所以引入atlas.h文件并声明类内私有成员Atlas指针默认nullptr，随后添加各种成员变量如：计时器，帧间隔，帧索引与动画是否循环标记。

成员函数方面提供reset函数将计时器与下标索引重置，setAtlas设置图集方法，setLoop设置是否循环播放，setInterval设置帧间隔，getIndexFrame获取当前播放序列帧下标，getFrame获取当前播放动画帧图片，checkFinished查看是否结束播放的方法。

最后就是动画更新逻辑部分，定义on_update更新方法逻辑与之前基本相同，以及on_draw方法，不过需要先在utils.h中编写putImageAlpha方法解决putImage方法不接受透明度通道的情况，记得需要添加MSIMG32.LIB库。

```
#ifndef _ANIMATION_H_
#define _ANIMATION_H_

#include "atlas.h"
#include "utiles.h

class Animation
{
public:
	Animation() = default;
	~Animation() = default;

	void reset()
	{
		this->m_timer = 0;
		this->m_idx_frame = 0;
	}

	void setAtlas(Atlas* new_atlas)
	{
		this->reset();
		this->m_atlas = new_atlas;
	}

	void setLoop(bool is_loop)
	{
		this->is_loop = is_loop;
	}

	void setInterval(int ms)
	{
		this->m_interval = ms;
	}

	int getIndexFrame()
	{
		return this->m_idx_frame;
	}

	IMAGE* getFrame()
	{
		return this->m_atlas->getImage(this->m_idx_frame);
	}

	bool checkFinished()
	{
		if (this->is_loop) return false;

		return this->m_idx_frame == this->m_atlas->getSize() - 1;
	}

	void on_update(int delta)
	{
		this->m_timer += delta;
		if (this->m_timer >= this->m_interval)
		{
			this->m_timer = 0;
			this->m_idx_frame++;
			if (this->m_idx_frame >= this->m_atlas->getSize())
			{
				this->m_idx_frame = (this->is_loop ? 0 : this->m_atlas->getSize() - 1);
			}
		}
	}

	void on_draw(int x, int y) const
	{
		putImageAlpha(x, y, this->m_atlas->getImage(this->m_idx_frame));
	}

private:
	int m_timer = 0;
	int m_interval = 0;
	int m_idx_frame = 0;

	bool is_loop = true;

	Atlas* m_atlas = nullptr;

};

#endif

//utils.h下添加编写putImageAlpha方法，基本不变
#pragma comment(lib, "MSIMG32.LIB")

void putImageAlpha(int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

```



### 生命周期结束动画播放逻辑

在生命周期结束时消失动画通常较为常用，这部分的逻辑又该如何编写？想要播放死亡动画但由于敌人死亡时直接删除了Enemy对象导致无法正常播放，解决方法很简单关键在于延后这些存在消失动画被删除的时间，即物品“死亡”时播放死亡动画，死亡动画播放结束再删除对象。

这就需要动画层面提供一个动画播放结束的消息，当然也可以在动画更新时使用checkFinished方法检查是否播放结束，但这里右更优雅更好的方式即回调函数，即使用参数传递的函数对象使用变量存储，再在合适时调用，例如将删除对象的方法保存，在死亡动画播放完毕时调用回调函数将对象删除来实现我们的目的。

在animation.h中添加头文件functional并在成员变量中添加std::function\<void\(\)\> m_callback变量，随后提供setCallback函数设置方法，并修改on_updata中逻辑部分：

```
//头文件
#include <functional>

//Animation类内成员变量callback回调函数
std::function<void()> m_callback;

//Animation类内成员函数setCallback方法
void setCallBack(std::function<void()> callback)
{
    this->m_callback = callback;
}

//添加下标越界后的询问是否调用回调函数
if (!this->is_loop && this->m_callback)
{
    this->m_callback();
}
```



## 第三节代码完成展示

**main.cpp**

```
#include "scene.h"
#include "menuScene.h"
#include "gameScene.h"
#include "selectorScene.h"
#include "sceneManager.h"
#include "atlas.h"
#include "utils.h"

#pragma comment(lib, "Winmm.lib")

#include <graphics.h>

const int FPS = 60;

IMAGE img_menu_background;					//主菜单背景图片

IMAGE img_VS;								//VS 艺术字图片
IMAGE img_1P;								//1P 文本图片
IMAGE img_2P;								//2P 文本图片
IMAGE img_1P_desc;							//1P 键位描述图片
IMAGE img_2P_desc;							//2P 键位描述图片
IMAGE img_select_background_left;			//选人朝左背景图片
IMAGE img_select_background_right;			//选人朝右背景图片
IMAGE img_selector_tip;						//选人界面提示信息
IMAGE img_selector_background;				//选人界面背景图
IMAGE img_1P_selector_btn_idle_left;		//1P 向左选择按钮默认状态图片
IMAGE img_1P_selector_btn_idle_right;		//1P 向右选择按钮默认状态图片
IMAGE img_1P_selector_btn_down_left;		//1P 向左选择按钮按下状态图片
IMAGE img_1P_selector_btn_down_right;		//1P 向右选择按钮按下状态图片
IMAGE img_2P_selector_btn_idle_left;		//2P 向左选择按钮默认状态图片
IMAGE img_2P_selector_btn_idle_right;		//2P 向右选择按钮默认状态图片
IMAGE img_2P_selector_btn_down_left;		//2P 向左选择按钮按下状态图片
IMAGE img_2P_selector_btn_down_right;		//2P 向右选择按钮按下状态图片
IMAGE img_gamer1_selector_background_left;	//选人界面类型1朝左背景图片
IMAGE img_gamer1_selector_background_right;	//选人界面类型1朝右背景图片
IMAGE img_gamer2_selector_background_left;	//选人界面类型2朝左背景图片
IMAGE img_gamer2_selector_background_right;	//选人界面类型2朝右背景图片

IMAGE img_sky;								//填空图片
IMAGE img_hills;							//山脉图片
IMAGE img_platform_large;					//大型平台图片
IMAGE img_platform_small;					//小型平台图片

IMAGE img_1P_cursor;						//1P 指示光标图片
IMAGE img_2P_cursor;						//2P 指示光标图片

Atlas atlas_gamer1_idle_left;				//类型1向左默认动画图集
Atlas atlas_gamer1_idle_right;				//类型1向右默认动画图集
Atlas atlas_gamer1_run_left;				//类型1向左奔跑动画图集
Atlas atlas_gamer1_run_right;				//类型1向右奔跑动画图集
Atlas atlas_gamer1_attack_ex_left;			//类型1向左特殊攻击动画图集
Atlas atlas_gamer1_attack_ex_right;			//类型1向右特殊攻击动画图集
Atlas atlas_gamer1_die_left;				//类型1向左死亡动画图集
Atlas atlas_gamer1_die_right;				//类型1向右死亡动画图集

Atlas atlas_gamer2_idle_left;				//类型2向左默认动画图集
Atlas atlas_gamer2_idle_right;				//类型2向右默认动画图集
Atlas atlas_gamer2_run_left;				//类型2向左奔跑动画图集
Atlas atlas_gamer2_run_right;				//类型2向右奔跑动画图集
Atlas atlas_gamer2_attack_ex_left;			//类型2向左特殊攻击动画图集
Atlas atlas_gamer2_attack_ex_right;			//类型2向右特殊攻击动画图集
Atlas atlas_gamer2_die_left;				//类型2向左死亡动画图集
Atlas atlas_gamer2_die_right;				//类型2向右死亡动画图集

IMAGE img_gamer1_bullet;					//类型1子弹图片
Atlas atlas_gamer1_bullet_break;			//类型1子弹破碎动画图集
Atlas atlas_gemer2_bullet;					//类型2子弹动画图集
Atlas atlas_gemer2_bullet_explode;			//类型2子弹爆炸动画图集
Atlas atlas_gamer2_bullet_ex;				//类型2特殊类型子弹动画图集
Atlas atlas_gamer2_bullet_ex_explode;		//类型2特殊类型子弹爆炸动画图集
Atlas atlas_gamer2_bullet_text;				//类型2特殊类型子弹爆炸文本动画图集

Atlas atlas_run_effect;						//奔跑特效动画图集
Atlas atlas_jump_effect;					//跳跃特效动画图集
Atlas atlas_land_effect;					//落地特效动画图集

IMAGE img_winner_bar;						//获胜玩家背景图片
IMAGE img_1P_winner;						//1P 获胜文本图片
IMAGE img_2P_winner;						//2P 获胜文本图片

IMAGE img_avatar_gamer1;					//类型1头像图片
IMAGE img_avatar_gamer2;					//类型2头像图片

Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;
Scene* selector_scene = nullptr;

SceneManager scene_manager;

void flipAtlas(Atlas& src, Atlas& dst)
{
	dst.clear();
	for (int i = 0; i < src.getSize(); i++)
	{
		IMAGE img_flpipped;
		flipImage(src.getImage(i), &img_flpipped);
		dst.addImage(img_flpipped);
	}
}

void loadGameResources()
{
	AddFontResourceEx(L"./resources/HYPixel11pxU-2.ttf", FR_PRIVATE, NULL);

	loadimage(&img_menu_background, L"./resources/menu_background.png");

	loadimage(&img_VS, L"./resources/VS.png");
	loadimage(&img_1P, L"./resources/1P.png");
	loadimage(&img_2P, L"./resources/2P.png");
	loadimage(&img_1P_desc, L"./resources/1P_desc.png");
	loadimage(&img_2P_desc, L"./resources/2P_desc.png");
	loadimage(&img_select_background_right, L"./resources/select_background.png");
	flipImage(&img_select_background_right, &img_select_background_left);
	loadimage(&img_selector_tip, L"./resources/selector_tip.png");
	loadimage(&img_selector_background, L"./resources/selector_background.png");
	loadimage(&img_1P_selector_btn_idle_right, L"./resources/1P_selector_btn_idle.png");
	flipImage(&img_1P_selector_btn_idle_right, &img_1P_selector_btn_idle_left);
	loadimage(&img_1P_selector_btn_down_right, L"./resources/1P_selector_btn_down.png");
	flipImage(&img_1P_selector_btn_down_right, &img_1P_selector_btn_down_left);
	loadimage(&img_2P_selector_btn_idle_right, L"./resources/2P_selector_btn_idle.png");
	flipImage(&img_2P_selector_btn_idle_right, &img_2P_selector_btn_idle_left);
	loadimage(&img_2P_selector_btn_down_right, L"./resources/2P_selector_btn_down.png");
	flipImage(&img_2P_selector_btn_down_right, &img_2P_selector_btn_down_left);
	loadimage(&img_gamer1_selector_background_right, L"./resources/gamer1_selector_background.png");
	flipImage(&img_gamer1_selector_background_right, &img_gamer1_selector_background_left);
	loadimage(&img_gamer2_selector_background_right, L"./resources/gamer2_selector_background.png");
	flipImage(&img_gamer2_selector_background_right, &img_gamer2_selector_background_left);

	loadimage(&img_sky, L"./resources/sky.png");
	loadimage(&img_hills, L"./resources/hills.png");
	loadimage(&img_platform_large, L"./resources/platform_large.png");
	loadimage(&img_platform_small, L"./resources/platform_small.png");

	loadimage(&img_1P_cursor, L"./resources/1P_cursor.png");
	loadimage(&img_2P_cursor, L"./resources/2P_cursor.png");

	atlas_gamer1_idle_right.loadFromFile(L"./resources/gamer1_idle_%d.png", 9);
	flipAtlas(atlas_gamer1_idle_right, atlas_gamer1_idle_left);
	atlas_gamer1_run_right.loadFromFile(L"./resources/gamer1_run_%d.png", 5);
	flipAtlas(atlas_gamer1_run_right, atlas_gamer1_run_left);
	atlas_gamer1_attack_ex_right.loadFromFile(L"./resources/gamer1_attack_ex_%d.png", 3);
	flipAtlas(atlas_gamer1_attack_ex_right, atlas_gamer1_attack_ex_left);
	atlas_gamer1_die_right.loadFromFile(L"./resources/gamer1_die_%d.png", 4);
	flipAtlas(atlas_gamer1_die_right, atlas_gamer1_die_left);

	atlas_gamer2_idle_right.loadFromFile(L"./resources/gamer2_idle_%d.png", 8);
	flipAtlas(atlas_gamer2_idle_right, atlas_gamer2_idle_left);
	atlas_gamer2_run_right.loadFromFile(L"./resources/gamer2_run_%d.png", 5);
	flipAtlas(atlas_gamer2_run_right, atlas_gamer2_run_left);
	atlas_gamer2_attack_ex_right.loadFromFile(L"./resources/gamer2_attack_ex_%d.png", 9);
	flipAtlas(atlas_gamer2_attack_ex_right, atlas_gamer2_attack_ex_left);
	atlas_gamer2_die_right.loadFromFile(L"./resources/gamer2_die_%d.png", 2);
	flipAtlas(atlas_gamer2_die_right, atlas_gamer2_die_left);

	loadimage(&img_gamer1_bullet, L"./resources/gamer1_bullet.png");
	atlas_gamer1_bullet_break.loadFromFile(L"./resources/gamer1_bullet_break_%d.png", 3);
	atlas_gemer2_bullet.loadFromFile(L"./resources/gamer2_bullet_%d.png", 5);
	atlas_gemer2_bullet_explode.loadFromFile(L"./resources/gamer2_bullet_explode_%d.png", 5);
	atlas_gamer2_bullet_ex.loadFromFile(L"./resources/gamer2_bullet_ex_%d.png", 5);
	atlas_gamer2_bullet_ex_explode.loadFromFile(L"./resources/gamer2_bullet_ex_explode_%d.png", 5);
	atlas_gamer2_bullet_text.loadFromFile(L"./resources/gamer2_bullet_text_%d.png", 6);

	atlas_run_effect.loadFromFile(L"./resources/run_effect_%d.png", 4);
	atlas_jump_effect.loadFromFile(L"./resources/jump_effect_%d.png", 5);
	atlas_land_effect.loadFromFile(L"./resources/land_effect_%d.png", 2);

	loadimage(&img_1P_winner, L"./resources/1P_winner.png");
	loadimage(&img_2P_winner, L"./resources/2P_winner.png");
	loadimage(&img_winner_bar, L"./resources/winner_bar.png");

	loadimage(&img_avatar_gamer1, L"./resources/avatar_gamer1.png");
	loadimage(&img_avatar_gamer2, L"./resources/avatar_gamer2.png");

	mciSendString(L"open ./resources/bgm_game.mp3 alias bgm_game", NULL, 0, NULL);
	mciSendString(L"open ./resources/bgm_menu.mp3 alias bgm_menu", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_1.mp3 alias gamer1_bullet_break_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_2.mp3 alias gamer1_bullet_break_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_3.mp3 alias gamer1_bullet_break_3", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_1.mp3 alias gamer1_bullet_shoot_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_2.mp3 alias gamer1_bullet_shoot_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_ex.mp3 alias gamer1_bullet_shoot_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode.mp3 alias gamer2_bullet_explode", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode_ex.mp3 alias gamer2_bullet_explode_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_text.mp3 alias gamer2_bullet_text", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_confirm.wav alias ui_confirm", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_switch.wav alias ui_switch", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_win.wav alias ui_win", NULL, 0, NULL);

	return;
}

int main()
{
	ExMessage msg;

	loadGameResources();
	
	initgraph(1200, 720);

	menu_scene = new MenuScene();
	game_scene = new GameScene();
	selector_scene = new SelectorScene();
	scene_manager.setCurrentState(menu_scene);

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene_manager.on_input(msg);
		}
		scene_manager.on_updata();

		cleardevice();
		scene_manager.on_draw();

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```

**utils.h**

```
#ifndef _UTILS_H_
#define _UTILS_H_

#pragma comment(lib, "MSIMG32.LIB")

#include <graphics.h>

void putImageAlpha(int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void flipImage(IMAGE* src, IMAGE* dst)
{
	int w = src->getwidth(), h = src->getheight();
	Resize(dst, w, h);
	
	DWORD* src_buffer = GetImageBuffer(src);
	DWORD* dst_buffer = GetImageBuffer(dst);
	for (int i = 0; i < h; i++)
	{
		for (int j = 0; j < w; j++)
		{
			int src_idx = i * w + j, dst_idx = (i + 1) * w - j - 1;
			dst_buffer[dst_idx] = src_buffer[src_idx];
		}
	}
	return;
}

#endif
```

**animation.h**

```
#ifndef _ANIMATION_H_
#define _ANIMATION_H_

#include <functional>

#include "atlas.h"
#include "utils.h"

class Animation
{
public:
	Animation() = default;
	~Animation() = default;

	void reset()
	{
		this->m_timer = 0;
		this->m_idx_frame = 0;
	}

	void setAtlas(Atlas* new_atlas)
	{
		this->reset();
		this->m_atlas = new_atlas;
	}

	void setLoop(bool is_loop)
	{
		this->is_loop = is_loop;
	}

	void setInterval(int ms)
	{
		this->m_interval = ms;
	}

	int getIndexFrame()
	{
		return this->m_idx_frame;
	}

	IMAGE* getFrame()
	{
		return this->m_atlas->getImage(this->m_idx_frame);
	}

	bool checkFinished()
	{
		if (this->is_loop) return false;

		return this->m_idx_frame == this->m_atlas->getSize() - 1;
	}

	void setCallBack(std::function<void()> callback)
	{
		this->m_callback = callback;
	}

	void on_update(int delta)
	{
		this->m_timer += delta;
		if (this->m_timer >= this->m_interval)
		{
			this->m_timer = 0;
			this->m_idx_frame++;
			if (this->m_idx_frame >= this->m_atlas->getSize())
			{
				this->m_idx_frame = (this->is_loop ? 0 : this->m_atlas->getSize() - 1);
				if (!this->is_loop && this->m_callback)
				{
					this->m_callback();
				}
			}
		}
	}

	void on_draw(int x, int y) const
	{
		putImageAlpha(x, y, this->m_atlas->getImage(this->m_idx_frame));
	}

private:
	int m_timer = 0;
	int m_interval = 0;
	int m_idx_frame = 0;

	bool is_loop = true;

	Atlas* m_atlas = nullptr;

	std::function<void()> m_callback;

};

#endif
```



## 第四节

游戏设计领域有一个很著名的概念叫"3C"，其几乎囊括了大部分游戏设计中最基本的三种元素角色Character，摄像机Camera，控制Control，决定视野与观察世界的核心元素就是Camera摄像机，为了让画面更灵活自然增强世界感，由此我们第四节进行讨论如何实现2D摄像机的基础。

虽然在之前项目中以及可以使用动画框架顺利进行渲染了，但摄像机作为整个框架中极为重要的一环，还是需要将这个部分集成到地产代码中去再开始更上层的主体逻辑开发。

### 3C——Camera摄像头概念

以超级马里奥为例，摄像头始终跟随马里奥，当马里奥向右移动实际相对的其他元素则是向左移动，也就是当整个背景向左移动，玩家也就向右移动了，也就是以玩家为参考系，移动玩家也就是移动除玩家外的所有对象，但是移动全体对象的话，碰撞检测与坐标相关问题该如何解决呢？

此时应引入两个重要概念进行比对，“窗口坐标系”与“世界坐标系”，窗口坐标系的概念我们一致都在使用还是比较熟悉了，在EasyX默认窗口坐标系就是左上角作为原点水平向右与竖直向下为x轴正方向与y轴正方向的坐标系，而世界坐标系就是更大更广阔的坐标系，任何的一切都是在世界坐标系下运转也就是只有在需要绘制时我们才考虑将他们防止到窗口坐标系下进行绘制等操作（比如Minecraft中打开F4看到的整个世界的坐标系，而玩家作为原点，加载范围左上角与右下角为终点的坐标系就是窗口坐标系），摄像机是世界坐标系与窗口坐标系之间转换的利器。

以上的设计思路正好符合最开始的设计理念，也就是数据与渲染分离，在不考虑缩放的情况下，如果摄像头画面与窗口画面大小一致时，摄像头可以看作在世界坐标系中的一个点，且这个点与玩家坐标位置始终保持一致，渲染场景中其他物体只需要将其他物体世界坐标与当前摄像机点位坐标做差得出位置，就是实际渲染位置：窗口坐标 = 世界坐标 - 摄像机坐标。

不过在编写Camera之前，我需要先对之前的动画类功能测试，以便摄像头类中可以使用。

### 动画类的测试与使用

首先来到menuScene.h中，引入atlas.h头文件与animation.h并使用extern声明外部动画图集，随后在MenuScene私有成员中定义Animation对象m_animation_gamer1_run_right并在成员函数on_enter中设置所使用的图集，帧间隔与循环状态

```
//头文件引入及外部变量引入，注意这里的顺序不然下面会报错
#include "atlas.h"
#include "animation.h"
#include "scene.h"
#include "sceneManager.h"

extern Atlas atlas_gamer1_run_right;

//MenuScene私有成员变量
Animation m_animation_gamer1_run_right;

//MenuScene成员函数on_enter初始化，这里如果出现参数不匹配就是头文件顺序需要调整
this->m_animation_gamer1_run_right.setAtlas(&atlas_gamer1_run_right);
this->m_animation_gamer1_run_right.setInterval(75);
this->m_animation_gamer1_run_right.setLoop(true);

```



我们接下来接下来需要进行on_updata编写但是发现，缺少了一个实际运行时间参数的传入，所以此处就需要小幅度重构代码了，首先是场景基类scene.h头文件中，对on_updata方法添加int delta表示实际时间参数随后给menuScene.h，gameScene.h，selectorScene.h中为重构的on_updata添加参数，以及对sceneManager.h中同样添加上on_updata的参数，对main.h中调用on_updata处传入参数即可。

```
//scene.h中重构
virtual void on_update(int delta) {}

//menuScene.h中重构
virtual void on_update(int delta)

//selectorScene.h中重构
virtual void on_update(int delta)

//gameScene.h中重构
virtual void on_update(int delta)

//sceneManager.h中重构
void on_updata(int delta)
{
    this->m_current_scene->on_update(delta);
}

//main.h中重写解决方案，通过getTickCount获取并计算上次调用时间间隔，来传入参数
static DWORD last_tick_time = GetTickCount();
DWORD current_tick_time = GetTickCount();
DWORD delta_tick_time = current_tick_time - last_tick_time;
scene_manager.on_updata(delta_tick_time);
last_tick_time = current_tick_time;

```



这个插曲可以注意到，一开始没有考虑好代码结构的设计是多糟糕的事情，一旦出现错误就需要翻遍整个项目进行修改，虽然对于新手出现类似的问题是正常的情况，属于是缺乏程序设计方面的经验，也是学习过程中必须要经历的问题，积累经验才能学会。

回到menuScene.h头文件的MenuScene类的on_draw方法中调用成员函数animation中的on_draw方法渲染在100，100位置处，运行程序能够正确看到渲染内容即成功。

```
//MenuScene类中修改如下代码
virtual void on_update(int delta)
{
	this->m_animation_gamer1_run_right.on_update(delta);
}

virtual void on_draw()
{
	this->m_animation_gamer1_run_right.on_draw(100, 100);
}
```



以及测试一下动画播放结束的回调函数，对menuScene中类内的on_enter修改，增加设置回调函数且使用lambda匿名函数的方式，运行结果可以正确执行跳转至此测试完毕：

```
this->m_animation_gamer1_run_right.setLoop(false);
this->m_animation_gamer1_run_right.setCallBack(
	[]()
	{
		scene_manager.switchTo(SceneManager::SceneType::Game);
	}
);
```



### Camera核心代码

前面探讨过程中，基本需求可以得知摄像机基本可以等效为一个点，虽然可以直接只有POINT来记录整个点，但是为了使用浮点更精细记录这个点我们需要建立在游戏框架中常见的二维向量类。

首先创建头文件vector2.h文件并定义Vector2类，添加公有成员浮点横纵坐标并编写有参构造方法，随后编写后续可能需要的运算符重载方便后续使用，最后添加两个成员函数获取斜边长度即向量长度与获取向量标准化方法：

```
#ifndef _VECTOR2_H_
#define _VECTOR2_H_

#include <cmath>

class Vector2
{
public:
	Vector2() = default;
	~Vector2() = default;

	Vector2(float x, float y) : m_x(x), m_y(y) {}

	Vector2 operator+(const Vector2& vec)
	{
		return Vector2(this->m_x + vec.m_x, this->m_y + vec.m_y);
	}

	void operator+=(const Vector2& vec)
	{
		this->m_x += vec.m_x, this->m_y += vec.m_y;
	}

	Vector2 operator-(const Vector2& vec)
	{
		return Vector2(this->m_x - vec.m_x, this->m_y - vec.m_y);
	}

	void operator-=(const Vector2& vec)
	{
		this->m_x -= vec.m_x, this->m_y -= vec.m_y;
	}

	float operator*(const Vector2& vec)
	{
		return this->m_x * vec.m_x + this->m_y * vec.m_y;
	}

	Vector2 operator* (const float val) const
	{
		return Vector2(this->m_x * val, this->m_y * val);
	}

	void operator*=(float val)
	{
		this->m_x *= val, this->m_y *= val;
	}

	float length()
	{
		return sqrt(pow(this->m_x, 2) + pow(this->m_y, 2));
	}

	Vector2 normalize()
	{
		float len = this->length();
		if (len == 0) return Vector2(0, 0);

		return Vector2(this->m_x / len, this->m_y / len);
	}

public:
	float m_x;
	float m_y;

};

#endif
```



接下来创建camera.h头文件定义Camera摄像机类，并在引入vector2.h头文件后创建私有成员变量m_position以及getPosition方法获取引用常量，提供reset方法使得坐标归零，声明on_updata方法因暂无需要添加的内容让其暂时空置：

```
#ifndef _CAMERA_H_
#define _CAMERA_H_

#include "vector2.h"

class Camera
{
public:
	Camera() = default;
	~Camera() = default;

	void reset()
	{
		this->m_position.m_y = this->m_position.m_x = 0;
	}

	const Vector2& getPosition() const
	{
		return this->m_position;
	}

	void on_updata(int delta)
	{

	}

private:
	Vector2 m_position;

};

#endif
```



### 摄像头功能测试

来到menuScene.h文件下，为观感更好，取消之前单词播放与回调函数并引入camera.h文件定义私有成员Camera并在on_draw中修改绘制方式，运行可以看到与之前相同的结果：

```
//头文件引入
#include "camera.h"

//MenuScene类内成员变量声明
Camera m_camera;

//修改成员函数on_enter
virtual void on_enter()
{
    this->m_animation_gamer1_run_right.setAtlas(&atlas_gamer1_run_right);
    this->m_animation_gamer1_run_right.setInterval(75);
    this->m_animation_gamer1_run_right.setLoop(true);
}

//修改成员函数on_draw
virtual void on_draw()
{
    const Vector2& pos_camera = this->m_camera.getPosition();
    this->m_animation_gamer1_run_right.on_draw((int)(100 - pos_camera.m_x), (int)(100 - pos_camera.m_y));
}

```



因为此时，摄像头的世界坐标是（0, 0）而渲染的动画坐标在（100, 100）此时做差与原先位置不变，想要确定功能实现的话我们应该尝试让摄像头动起来，首先需要在MenuScene中的on_updata调用Camera的on_updata方法，随后回到camera.h中修改on_updata方法编写如下逻辑再运行程序，可以看到渲染的动画水平向右移动，正是因为摄像头x坐标变小（摄像头向左水平移动）导致的，由此摄像头的基础完成：

```
void on_updata(int delta)
{
	const Vector2 speed = { -0.35f, 0 };
	this->m_position += speed * (float)delta;
}
```



## 第四节代码完成展示

**main.cpp**

```
#include "atlas.h"

#include "scene.h"
#include "sceneManager.h"
#include "menuScene.h"
#include "gameScene.h"
#include "selectorScene.h"

#include "utils.h"

#pragma comment(lib, "Winmm.lib")

#include <graphics.h>

const int FPS = 60;

IMAGE img_menu_background;					//主菜单背景图片

IMAGE img_VS;								//VS 艺术字图片
IMAGE img_1P;								//1P 文本图片
IMAGE img_2P;								//2P 文本图片
IMAGE img_1P_desc;							//1P 键位描述图片
IMAGE img_2P_desc;							//2P 键位描述图片
IMAGE img_select_background_left;			//选人朝左背景图片
IMAGE img_select_background_right;			//选人朝右背景图片
IMAGE img_selector_tip;						//选人界面提示信息
IMAGE img_selector_background;				//选人界面背景图
IMAGE img_1P_selector_btn_idle_left;		//1P 向左选择按钮默认状态图片
IMAGE img_1P_selector_btn_idle_right;		//1P 向右选择按钮默认状态图片
IMAGE img_1P_selector_btn_down_left;		//1P 向左选择按钮按下状态图片
IMAGE img_1P_selector_btn_down_right;		//1P 向右选择按钮按下状态图片
IMAGE img_2P_selector_btn_idle_left;		//2P 向左选择按钮默认状态图片
IMAGE img_2P_selector_btn_idle_right;		//2P 向右选择按钮默认状态图片
IMAGE img_2P_selector_btn_down_left;		//2P 向左选择按钮按下状态图片
IMAGE img_2P_selector_btn_down_right;		//2P 向右选择按钮按下状态图片
IMAGE img_gamer1_selector_background_left;	//选人界面类型1朝左背景图片
IMAGE img_gamer1_selector_background_right;	//选人界面类型1朝右背景图片
IMAGE img_gamer2_selector_background_left;	//选人界面类型2朝左背景图片
IMAGE img_gamer2_selector_background_right;	//选人界面类型2朝右背景图片

IMAGE img_sky;								//填空图片
IMAGE img_hills;							//山脉图片
IMAGE img_platform_large;					//大型平台图片
IMAGE img_platform_small;					//小型平台图片

IMAGE img_1P_cursor;						//1P 指示光标图片
IMAGE img_2P_cursor;						//2P 指示光标图片

Atlas atlas_gamer1_idle_left;				//类型1向左默认动画图集
Atlas atlas_gamer1_idle_right;				//类型1向右默认动画图集
Atlas atlas_gamer1_run_left;				//类型1向左奔跑动画图集
Atlas atlas_gamer1_run_right;				//类型1向右奔跑动画图集
Atlas atlas_gamer1_attack_ex_left;			//类型1向左特殊攻击动画图集
Atlas atlas_gamer1_attack_ex_right;			//类型1向右特殊攻击动画图集
Atlas atlas_gamer1_die_left;				//类型1向左死亡动画图集
Atlas atlas_gamer1_die_right;				//类型1向右死亡动画图集

Atlas atlas_gamer2_idle_left;				//类型2向左默认动画图集
Atlas atlas_gamer2_idle_right;				//类型2向右默认动画图集
Atlas atlas_gamer2_run_left;				//类型2向左奔跑动画图集
Atlas atlas_gamer2_run_right;				//类型2向右奔跑动画图集
Atlas atlas_gamer2_attack_ex_left;			//类型2向左特殊攻击动画图集
Atlas atlas_gamer2_attack_ex_right;			//类型2向右特殊攻击动画图集
Atlas atlas_gamer2_die_left;				//类型2向左死亡动画图集
Atlas atlas_gamer2_die_right;				//类型2向右死亡动画图集

IMAGE img_gamer1_bullet;					//类型1子弹图片
Atlas atlas_gamer1_bullet_break;			//类型1子弹破碎动画图集
Atlas atlas_gemer2_bullet;					//类型2子弹动画图集
Atlas atlas_gemer2_bullet_explode;			//类型2子弹爆炸动画图集
Atlas atlas_gamer2_bullet_ex;				//类型2特殊类型子弹动画图集
Atlas atlas_gamer2_bullet_ex_explode;		//类型2特殊类型子弹爆炸动画图集
Atlas atlas_gamer2_bullet_text;				//类型2特殊类型子弹爆炸文本动画图集

Atlas atlas_run_effect;						//奔跑特效动画图集
Atlas atlas_jump_effect;					//跳跃特效动画图集
Atlas atlas_land_effect;					//落地特效动画图集

IMAGE img_winner_bar;						//获胜玩家背景图片
IMAGE img_1P_winner;						//1P 获胜文本图片
IMAGE img_2P_winner;						//2P 获胜文本图片

IMAGE img_avatar_gamer1;					//类型1头像图片
IMAGE img_avatar_gamer2;					//类型2头像图片

Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;
Scene* selector_scene = nullptr;

SceneManager scene_manager;

void flipAtlas(Atlas& src, Atlas& dst)
{
	dst.clear();
	for (int i = 0; i < src.getSize(); i++)
	{
		IMAGE img_flpipped;
		flipImage(src.getImage(i), &img_flpipped);
		dst.addImage(img_flpipped);
	}
}

void loadGameResources()
{
	AddFontResourceEx(L"./resources/HYPixel11pxU-2.ttf", FR_PRIVATE, NULL);

	loadimage(&img_menu_background, L"./resources/menu_background.png");

	loadimage(&img_VS, L"./resources/VS.png");
	loadimage(&img_1P, L"./resources/1P.png");
	loadimage(&img_2P, L"./resources/2P.png");
	loadimage(&img_1P_desc, L"./resources/1P_desc.png");
	loadimage(&img_2P_desc, L"./resources/2P_desc.png");
	loadimage(&img_select_background_right, L"./resources/select_background.png");
	flipImage(&img_select_background_right, &img_select_background_left);
	loadimage(&img_selector_tip, L"./resources/selector_tip.png");
	loadimage(&img_selector_background, L"./resources/selector_background.png");
	loadimage(&img_1P_selector_btn_idle_right, L"./resources/1P_selector_btn_idle.png");
	flipImage(&img_1P_selector_btn_idle_right, &img_1P_selector_btn_idle_left);
	loadimage(&img_1P_selector_btn_down_right, L"./resources/1P_selector_btn_down.png");
	flipImage(&img_1P_selector_btn_down_right, &img_1P_selector_btn_down_left);
	loadimage(&img_2P_selector_btn_idle_right, L"./resources/2P_selector_btn_idle.png");
	flipImage(&img_2P_selector_btn_idle_right, &img_2P_selector_btn_idle_left);
	loadimage(&img_2P_selector_btn_down_right, L"./resources/2P_selector_btn_down.png");
	flipImage(&img_2P_selector_btn_down_right, &img_2P_selector_btn_down_left);
	loadimage(&img_gamer1_selector_background_right, L"./resources/gamer1_selector_background.png");
	flipImage(&img_gamer1_selector_background_right, &img_gamer1_selector_background_left);
	loadimage(&img_gamer2_selector_background_right, L"./resources/gamer2_selector_background.png");
	flipImage(&img_gamer2_selector_background_right, &img_gamer2_selector_background_left);

	loadimage(&img_sky, L"./resources/sky.png");
	loadimage(&img_hills, L"./resources/hills.png");
	loadimage(&img_platform_large, L"./resources/platform_large.png");
	loadimage(&img_platform_small, L"./resources/platform_small.png");

	loadimage(&img_1P_cursor, L"./resources/1P_cursor.png");
	loadimage(&img_2P_cursor, L"./resources/2P_cursor.png");

	atlas_gamer1_idle_right.loadFromFile(L"./resources/gamer1_idle_%d.png", 9);
	flipAtlas(atlas_gamer1_idle_right, atlas_gamer1_idle_left);
	atlas_gamer1_run_right.loadFromFile(L"./resources/gamer1_run_%d.png", 5);
	flipAtlas(atlas_gamer1_run_right, atlas_gamer1_run_left);
	atlas_gamer1_attack_ex_right.loadFromFile(L"./resources/gamer1_attack_ex_%d.png", 3);
	flipAtlas(atlas_gamer1_attack_ex_right, atlas_gamer1_attack_ex_left);
	atlas_gamer1_die_right.loadFromFile(L"./resources/gamer1_die_%d.png", 4);
	flipAtlas(atlas_gamer1_die_right, atlas_gamer1_die_left);

	atlas_gamer2_idle_right.loadFromFile(L"./resources/gamer2_idle_%d.png", 8);
	flipAtlas(atlas_gamer2_idle_right, atlas_gamer2_idle_left);
	atlas_gamer2_run_right.loadFromFile(L"./resources/gamer2_run_%d.png", 5);
	flipAtlas(atlas_gamer2_run_right, atlas_gamer2_run_left);
	atlas_gamer2_attack_ex_right.loadFromFile(L"./resources/gamer2_attack_ex_%d.png", 9);
	flipAtlas(atlas_gamer2_attack_ex_right, atlas_gamer2_attack_ex_left);
	atlas_gamer2_die_right.loadFromFile(L"./resources/gamer2_die_%d.png", 2);
	flipAtlas(atlas_gamer2_die_right, atlas_gamer2_die_left);

	loadimage(&img_gamer1_bullet, L"./resources/gamer1_bullet.png");
	atlas_gamer1_bullet_break.loadFromFile(L"./resources/gamer1_bullet_break_%d.png", 3);
	atlas_gemer2_bullet.loadFromFile(L"./resources/gamer2_bullet_%d.png", 5);
	atlas_gemer2_bullet_explode.loadFromFile(L"./resources/gamer2_bullet_explode_%d.png", 5);
	atlas_gamer2_bullet_ex.loadFromFile(L"./resources/gamer2_bullet_ex_%d.png", 5);
	atlas_gamer2_bullet_ex_explode.loadFromFile(L"./resources/gamer2_bullet_ex_explode_%d.png", 5);
	atlas_gamer2_bullet_text.loadFromFile(L"./resources/gamer2_bullet_text_%d.png", 6);

	atlas_run_effect.loadFromFile(L"./resources/run_effect_%d.png", 4);
	atlas_jump_effect.loadFromFile(L"./resources/jump_effect_%d.png", 5);
	atlas_land_effect.loadFromFile(L"./resources/land_effect_%d.png", 2);

	loadimage(&img_1P_winner, L"./resources/1P_winner.png");
	loadimage(&img_2P_winner, L"./resources/2P_winner.png");
	loadimage(&img_winner_bar, L"./resources/winner_bar.png");

	loadimage(&img_avatar_gamer1, L"./resources/avatar_gamer1.png");
	loadimage(&img_avatar_gamer2, L"./resources/avatar_gamer2.png");

	mciSendString(L"open ./resources/bgm_game.mp3 alias bgm_game", NULL, 0, NULL);
	mciSendString(L"open ./resources/bgm_menu.mp3 alias bgm_menu", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_1.mp3 alias gamer1_bullet_break_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_2.mp3 alias gamer1_bullet_break_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_3.mp3 alias gamer1_bullet_break_3", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_1.mp3 alias gamer1_bullet_shoot_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_2.mp3 alias gamer1_bullet_shoot_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_ex.mp3 alias gamer1_bullet_shoot_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode.mp3 alias gamer2_bullet_explode", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode_ex.mp3 alias gamer2_bullet_explode_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_text.mp3 alias gamer2_bullet_text", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_confirm.wav alias ui_confirm", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_switch.wav alias ui_switch", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_win.wav alias ui_win", NULL, 0, NULL);

	return;
}

int main()
{
	ExMessage msg;

	loadGameResources();
	
	initgraph(1200, 720);

	menu_scene = new MenuScene();
	game_scene = new GameScene();
	selector_scene = new SelectorScene();
	scene_manager.setCurrentState(menu_scene);


	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene_manager.on_input(msg);
		}

		static DWORD last_tick_time = GetTickCount();
		DWORD current_tick_time = GetTickCount();
		DWORD delta_tick_time = current_tick_time - last_tick_time;
		scene_manager.on_updata(delta_tick_time);
		last_tick_time = current_tick_time;

		cleardevice();
		scene_manager.on_draw();

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```

**scene.h**

```
#ifndef _SCENE_H_
#define _SCENE_H_

#include <graphics.h>

class Scene
{
public:
	Scene() = default;
	~Scene() = default;

	virtual void on_enter() {}
	virtual void on_update(int delta) {}
	virtual void on_draw() {}
	virtual void on_input(const ExMessage& msg) {}
	virtual void on_exit() {}

private:

};

#endif
```

**menuScene.h**

```
#ifndef _MENU_SCENE_H_
#define _MENU_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include "animation.h"
#include "camera.h"

#include <iostream>

extern Atlas atlas_gamer1_run_right;

extern SceneManager scene_manager;

class MenuScene : public Scene
{
public:
	MenuScene() = default;
	~MenuScene() = default;

	virtual void on_enter()
	{
		this->m_animation_gamer1_run_right.setAtlas(&atlas_gamer1_run_right);
		this->m_animation_gamer1_run_right.setInterval(75);
		this->m_animation_gamer1_run_right.setLoop(true);
	}

	virtual void on_update(int delta)
	{
		this->m_camera.on_updata(delta);
		this->m_animation_gamer1_run_right.on_update(delta);
	}

	virtual void on_draw()
	{
		const Vector2& pos_camera = this->m_camera.getPosition();
		this->m_animation_gamer1_run_right.on_draw((int)(100 - pos_camera.m_x), (int)(100 - pos_camera.m_y));
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			scene_manager.switchTo(SceneManager::SceneType::Selector);
		}
	}

	virtual void on_exit()
	{
		std::cout << "主菜单退出！" << std::endl;
	}

private:
	Animation m_animation_gamer1_run_right;
	Camera m_camera;

};

#endif
```

**selectorScene.h**

```
#ifndef _SELECTOR_SCENE_H_
#define _SELECTOR_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern SceneManager scene_manager;

class SelectorScene : public Scene
{
public:
	SelectorScene() = default;
	~SelectorScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入选人！" << std::endl;
	}

	virtual void on_update(int delta)
	{
		std::cout << "选人运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"选人绘制");
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			scene_manager.switchTo(SceneManager::SceneType::Game);
		}
	}

	virtual void on_exit()
	{
		std::cout << "选人退出！" << std::endl;
	}

private:

};

#endif
```

**gameScene.h**

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern SceneManager scene_manager;

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter()
	{
		std::cout << "进入游戏局内场景！" << std::endl;
	}

	virtual void on_update(int delta)
	{
		std::cout << "游戏运行中..." << std::endl;
	}

	virtual void on_draw()
	{
		outtextxy(10, 10, L"游戏局内绘制");
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			scene_manager.switchTo(SceneManager::SceneType::Menu);
		}
	}

	virtual void on_exit()
	{
		std::cout << "游戏局内退出！" << std::endl;
	}

private:

};

#endif
```

**vector2.h**

```
#ifndef _VECTOR2_H_
#define _VECTOR2_H_

#include <cmath>

class Vector2
{
public:
	Vector2() = default;
	~Vector2() = default;

	Vector2(float x, float y) : m_x(x), m_y(y) {}

	Vector2 operator+(const Vector2& vec)
	{
		return Vector2(this->m_x + vec.m_x, this->m_y + vec.m_y);
	}

	void operator+=(const Vector2& vec)
	{
		this->m_x += vec.m_x, this->m_y += vec.m_y;
	}

	Vector2 operator-(const Vector2& vec)
	{
		return Vector2(this->m_x - vec.m_x, this->m_y - vec.m_y);
	}

	void operator-=(const Vector2& vec)
	{
		this->m_x -= vec.m_x, this->m_y -= vec.m_y;
	}

	float operator*(const Vector2& vec)
	{
		return this->m_x * vec.m_x + this->m_y * vec.m_y;
	}

	Vector2 operator*(const float val) const
	{
		return Vector2(this->m_x * val, this->m_y * val);
	}

	void operator*=(float val)
	{
		this->m_x *= val, this->m_y *= val;
	}

	float length()
	{
		return sqrt(pow(this->m_x, 2) + pow(this->m_y, 2));
	}

	Vector2 normalize()
	{
		float len = this->length();
		if (len == 0) return Vector2(0, 0);

		return Vector2(this->m_x / len, this->m_y / len);
	}

public:
	float m_x;
	float m_y;

};

#endif
```

**camera.h**

```
#ifndef _CAMERA_H_
#define _CAMERA_H_

#include "vector2.h"

class Camera
{
public:
	Camera() = default;
	~Camera() = default;

	void reset()
	{
		this->m_position.m_y = this->m_position.m_x = 0;
	}

	const Vector2& getPosition() const
	{
		return this->m_position;
	}

	void on_updata(int delta)
	{
		const Vector2 speed = { -0.35f, 0 };
		this->m_position += speed * (float)delta;
	}

private:
	Vector2 m_position;

};

#endif
```



## 第五节

### 抖动效果引入

游戏的画面不一定是素材的累积，很多时候质感有也可以通过一些小技巧快速提升，这一节将在之前Camera基础上实现摄像机抖动的效果，很多时候开发者会选择让屏幕以不同幅度的抖动来透过屏幕表现打击的力量感，可以说这是一种实现起来相对廉价的但表现不错的视觉特效。

### 计时器概念

摄像机的抖动特效作为玩家画面的一个限时状态，必然要在开始的一段时间后结束这种效果，所以和之前的播控相似，也需要一个定时器来控制特效的开始与结束时刻，并且从长远的角度看，技能CD或无敌帧等等效果都需要时间相关的功能，所以不如先封装一个通用定时器来对这些有时效性的功能提供相对统一的管理模式。

关于实现部分还是需要考虑其设计思想的，这里有两种定时器设计思路，一是继承二回调；

  **·**  继承在on_updata中指向定时器时间到达时的逻辑，这部分逻辑封装在callback成员方法中，如果想要实现自己的定时器就要实现自己的定时器逻辑，那么只需让自己的定时器集成自Timer基类并重写callback方法，在使用时通过多态便能执行重写后的定时器逻辑。

  **·**  回调与继承的逻辑相似，通过setCallback成员方法，讲回调函数保存在对象内部并在合适时进行调用，使用时只需向对象注册自己的回调函数即可。

对比两种定时器实现方式，明显实现回调函数的定时器在代码编写上更为简洁，如果需要不同逻辑的定时器，在继承的方法上就需要编写很多不同的计时器子类，而回调的方法中只需要实例化计时器并编写一个lambda函数即可。

而从代码设计的思路，像通用计时器这类只需要扩展回调方法逻辑而无需扩展数据成员内容的类，我们会更倾向于使用回调函数思路而非使用类的继承，在代码编写起来更加轻松，并且语义上会更加明确。

### 计时器类实现

创建文件Timer.h头文件创建Timer类，声明六项私有成员变量并设计成员方法，提供了reset重置计时器时钟，setWaitTime设置等待时间，setOneShot设置是否单次触发，setCallback设置回调函数，pause使计时器暂停计时，resume使计时器继续进行计时， 最后是核心的更新逻辑on_updata，首先判断是否暂停如果暂停则直接返回，随后对过去时间累加更新帧时间并将计时器启动以来过去的时间与期望时间比较，尝试触发定时器回调函数，注意要检查是否单次触发与是否被触发与callback是否有效才触发callback回调函数，最后进行标记并清空计时：

```
#ifndef _TIMER_H_
#define _TIMER_H_

#include <functional>

class Timer
{
public:
	Timer() = default;
	~Timer() = default;
	
	void restart()
	{
		this->m_pass_time = 0;
		this->is_shotted = false;
	}

	void setWaitTime(int wait_time)
	{
		this->m_wait_time = wait_time;
	}

	void setOneShot(bool is_one_shot)
	{
		this->is_one_shot = is_one_shot;
	}

	void setCallback(std::function<void()> callback)
	{
		this->m_callback = callback;
	}

	void pause()
	{
		this->is_paused = true;
	}

	void resume()
	{
		this->is_paused = false;
	}

	void on_updata(int delta)
	{
		if (!this->is_paused)
		{
			this->m_pass_time += delta;
			if (this->m_pass_time >= this->m_wait_time) 
			{
				if ((!this->is_one_shot || (this->is_one_shot && !this->is_shotted)) && this->m_callback) this->m_callback();

				this->is_shotted = true;
				this->m_pass_time = 0;
			}
		}
	}

private:
	int m_pass_time = 0;//已过时间
	int m_wait_time = 0;//等待时间
	bool is_paused = false;//是否暂停
	bool is_shotted = false;//是否触发
	bool is_one_shot = false;//是否单次触发
	std::function<void()> m_callback;//回调函数

};

#endif
```



代码完成，我们应该开始继承到摄像机类中吗？不，在前面的学习部分已进行了说明，每当我们完成一个功能模块的开发应首要完成的是对其进行测试，避免代码错误累加导致调式困难。

来到menuScene.h头文件中引入timer.h头文件并在私有成员中定义Timer对象在on_enter中对非法进行设置，在on_updata中对方法进行更新，运行程序可以看到命令行每隔一秒重复输出"WOOF!!"即正确完成：

```
//成员变量声明
Timer m_timer;

//成员函数on_enter进行初始化
this->m_timer.setWaitTime(1000);
this->m_timer.setOneShot(false);
this->m_timer.setCallback(
    []()
    {
        std::cout << "WOOF!!" << std::endl;
    }
);

//成员函数on_updata更新计时器
this->m_timer.on_updata(delta);
```



### 摄像机抖动

首先先考虑摄像头抖动效果应如何设计，在前面的设计中我们将摄像头看作世界坐标与窗口坐标的转换器，即将世界坐标与摄像头坐标做差即可得到渲染图形坐标，如果需要将屏幕中所有内容进行抖动就可以改为快速晃动摄像头即可，即在短时间内快速改变摄像头坐标就行，不过晃动方式不同呈现的效果也会不同，一种简单的方法是在以抖动强度为半径的院内随机设置摄像头的位置，因为帧更新速度很快所以在宏观上可以做到抖动效果，如果想要抖动更加平滑可以使用柏林噪音生成的随机数取代简单的随机数生成，不过这就涉及到深层的算法问题了，且本项目摄像机小幅度抖动使用柏林噪声优化提升不大，所以此处不多做涉及仅使用简单的随机数生成即可。

接下来就可以将计时器集成到摄像头中了，打开camera.h文件并引入timer.h头文件，扩展三个成员变量计时器，是否抖动中和抖动幅度用于控制摄像头抖动效果，随后，为了启用抖动效果提供shake成员函数设置启动抖动并设置强度与抖动时长，最后修改on_updata中内容更新计时器并根据状态进行抖动，并且我们希望测试其是否成功完成，打开menuScene.h头文件在on_input中编写在按下空格时启动抖动，运行程序发现成功抖动完成：

```
//camera.h成员变量声明
Timer m_shake_timer;
bool is_shaking = false;
float m_shaking_strength = 0;

//camera.h构造函数初始化计时器
this->m_shake_timer.setOneShot(true);
this->m_shake_timer.setCallback(
	[&]()
	{
		this->is_shaking = false;
		this->restart();
	}
);

//camera.h成员函数shake编写
void shake(float strength, int duration)
{
	this->is_shaking = true;
	this->m_shaking_strength = strength;

	this->m_shake_timer.setWaitTime(duration);
	this->m_shake_timer.restart();
}

//camera.h修改成员函数on_updata内容
this->m_shake_timer.on_updata(delta);

if (this->is_shaking)
{
	float radius = this->m_shaking_strength;
	float angle = (float)(rand() % 360) * 3.141592f / 180.0f;

	this->m_position.m_x = radius * cos(angle);
	this->m_position.m_y = radius * sin(angle);
}

//menuScene.h中修改on_input成员函数
if (msg.message == WM_KEYDOWN)
{
    if (msg.vkcode == VK_SPACE) this->m_camera.shake(10, 350);
    else scene_manager.switchTo(SceneManager::SceneType::Selector);
}
```



## 第五节代码完成展示

**menuScene.h**

```
#ifndef _MENU_SCENE_H_
#define _MENU_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include "timer.h"
#include "animation.h"
#include "camera.h"

#include <iostream>

extern Atlas atlas_gamer1_run_right;

extern SceneManager scene_manager;

class MenuScene : public Scene
{
public:
	MenuScene() = default;
	~MenuScene() = default;

	virtual void on_enter()
	{
		this->m_animation_gamer1_run_right.setAtlas(&atlas_gamer1_run_right);
		this->m_animation_gamer1_run_right.setInterval(75);
		this->m_animation_gamer1_run_right.setLoop(true);
		
		this->m_timer.setWaitTime(1000);
		this->m_timer.setOneShot(false);
		this->m_timer.setCallback(
			[]()
			{
				std::cout << "WOOF!!" << std::endl;
			}
		);
	}

	virtual void on_update(int delta)
	{
		this->m_timer.on_updata(delta);
		this->m_camera.on_updata(delta);
		this->m_animation_gamer1_run_right.on_update(delta);
	}

	virtual void on_draw()
	{
		const Vector2& pos_camera = this->m_camera.getPosition();
		this->m_animation_gamer1_run_right.on_draw((int)(100 - pos_camera.m_x), (int)(100 - pos_camera.m_y));
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYDOWN)
		{
			if (msg.vkcode == VK_SPACE) this->m_camera.shake(10, 350);
			else scene_manager.switchTo(SceneManager::SceneType::Selector);
		}
	}

	virtual void on_exit()
	{
		std::cout << "主菜单退出！" << std::endl;
	}

private:
	Animation m_animation_gamer1_run_right;
	Camera m_camera;
	Timer m_timer;

};

#endif
```

**camera.h**

```
#ifndef _CAMERA_H_
#define _CAMERA_H_

#include "timer.h"
#include "vector2.h"

class Camera
{
public:
	Camera()
	{
		this->m_shake_timer.setOneShot(true);
		this->m_shake_timer.setCallback(
			[&]()
			{
				this->is_shaking = false;
				this->reset();
			}
		);
	}

	~Camera() = default;

	void reset()
	{
		this->m_position.m_y = this->m_position.m_x = 0;
	}

	const Vector2& getPosition() const
	{
		return this->m_position;
	}

	void on_updata(int delta)
	{
		this->m_shake_timer.on_updata(delta);

		if (this->is_shaking)
		{
			float radius = this->m_shaking_strength;
			float angle = (float)(rand() % 360) * 3.141592f / 180.0f;

			this->m_position.m_x = radius * cos(angle);
			this->m_position.m_y = radius * sin(angle);
		}
	}

	void shake(float strength, int duration)
	{
		this->is_shaking = true;
		this->m_shaking_strength = strength;

		this->m_shake_timer.setWaitTime(duration);
		this->m_shake_timer.restart();
	}

private:
	Vector2 m_position;
	
	Timer m_shake_timer;
	bool is_shaking = false;
	float m_shaking_strength = 0;

};

#endif
```

**timer.h**

```
#ifndef _TIMER_H_
#define _TIMER_H_

#include <functional>

class Timer
{
public:
	Timer() = default;
	~Timer() = default;
	
	void restart()
	{
		this->m_pass_time = 0;
		this->is_shotted = false;
	}

	void setWaitTime(int wait_time)
	{
		this->m_wait_time = wait_time;
	}

	void setOneShot(bool is_one_shot)
	{
		this->is_one_shot = is_one_shot;
	}

	void setCallback(std::function<void()> callback)
	{
		this->m_callback = callback;
	}

	void pause()
	{
		this->is_paused = true;
	}

	void resume()
	{
		this->is_paused = false;
	}

	void on_updata(int delta)
	{
		if (!this->is_paused)
		{
			this->m_pass_time += delta;
			if (this->m_pass_time >= this->m_wait_time) 
			{
				if ((!this->is_one_shot || (this->is_one_shot && !this->is_shotted)) && this->m_callback) this->m_callback();

				this->is_shotted = true;
				this->m_pass_time = 0;
			}
		}
	}

private:
	int m_pass_time = 0;//已过时间
	int m_wait_time = 0;//等待时间
	bool is_paused = false;//是否暂停
	bool is_shotted = false;//是否触发
	bool is_one_shot = false;//是否单次触发
	std::function<void()> m_callback;//回调函数

};

#endif
```



## 第六节

### 摄像机实例化与使用

接下来我们需要思考一个渲染相关的问题，前完成了摄像机相关的部分内容，接下来我们需要考虑控制游戏的“主摄像机”对象应该声明在何处？正如之前测试时的动画渲染效果我们需要确保每一个场景在执行渲染时都可以获取到摄像机对象从而根据位置进行实际画面渲染。

思路一是定义在场景内部作为场景内成员对象使用，但是不同场景间的摄像机数据就很难进行共享了。

思路二是定义为全局变量和图片资源一样使用extern关键字获取，但全局变量终归是不美观，在项目编写时我们使用面向对象思想一步步对数据进行封装，其中一个很重要的思想就是尽可能去减少全局变量的使用。

那么我们还能使用哪种设计呢，在on_updata时我们使用传参的方法将delta传入，我们也可以将Camera作为参数在对象渲染时通过参数传递使用，只不过这就需要我们再次重构代码了。

首先是scene.h中为on_draw添加参数const Camera& camera，并将其子类对应修改相应重写函数：

```
//scene.h文件添加头文件
#include "camera.h"

//scene.h文件Scene类重写on_draw方法
virtual void on_draw(const Camera& camera) {}

//menuScene.h文件类重写on_draw方法
virtual void on_draw(const Camera& camera)

//selectorScene.h文件类重写on_draw方法
virtual void on_draw(const Camera& camera)

//gameScene.h文件类重写on_draw方法
virtual void on_draw(const Camera& camera)
```



既然所有场景我们都可以通过参数传递获取到摄像机，那么我们就需要再场景管理器绘图阶段将使用的摄像机传入当前场景，也就是修改SceneManager中的on_draw方法修改，随后将main.cpp全局区声明摄像机并在主循环内渲染阶段将摄像机对象传递给场景管理器：

```
//sceneManager.h修改成员函数
void on_draw(const Camera& camera)
{
	this->m_current_scene->on_draw(camera);
}

//main.cpp全局变量
#include "camera.h"
Camera main_camera;

//main.cpp渲染部分修改
scene_manager.on_draw(main_camera);

```



虽然摄像机已经继承到框架中了，但是似乎还是没有避免使用全局变量？虽然在渲染方法的调用过程中只使用了摄像机的位置数据，但摄像机的其他功能例如抖动效果依旧需要编写到渲染方法外，也就是说由于我们没有提供在运行时动态检索游戏对象的设计，所以依然保有部分全局变量也是无奈之举。

不过随着项目的深入，在使用GameObject将整个项目大统一时，我们项目的整个设计将会更加优雅。



### 菜单场景编写

接下来逐步填充各个场景，首先是菜单场景，先前为测试编写了很多无关的代码，首先就需要清空这些代码，将MenuScene类，SelectorScene类，GameScene类的成员变量与on相关方法内部代码清空例如下：

```
#ifndef _MENU_SCENE_H_
#define _MENU_SCENE_H_

#include "scene.h"

class MenuScene : public Scene
{
public:
	MenuScene() = default;
	~MenuScene() = default;

	virtual void on_enter()
	{
	}

	virtual void on_update(int delta)
	{
	}

	virtual void on_draw(const Camera& camera)
	{
	}

	virtual void on_input(const ExMessage& msg)
	{
	}

	virtual void on_exit()
	{
	}

private:

};

#endif
```



随后我们开始填充MenuScene代码，首先使用extern关键字引入主菜单场景所需的背景资源，随后编写on_draw中使用putimage方法将背景渲染到窗口中，不过为了确保多态接口的一致性on_draw参数不必进行修改，并在on_enter方法中播放背景音乐，最后在on_input中编写按下任意键跳转场景的逻辑：

```
//全局区声明资源
#include "sceneManager.h"

extern SceneManager scene_manager;
extern IMAGE img_menu_background;

//成员函数on_draw方法
putimage(0, 0, &img_menu_background);

//成员函数on_enter方法
mciSendString(L"play bgm_menu repeat from 0", NULL, 0, NULL);

//成员函数ono_input方法
if (msg.message == WM_KEYUP)
{
    mciSendString(L"play ui_confirm repeat from 0", NULL, 0, NULL);
	scene_manager.switchTo(SceneManager::SceneType::Selector);
}
```



### 选角场景编写

接下来开始编写角色选择界面的逻辑，首先引入atlas.h头文件并使用extern声明所需图集与图片资源，为了将资源渲染在正确位置，我们在类内定义一系列POINT类型变量并在on_enter进行初始化，这里并未是直接使用屏幕宽高而是表达式的方法就是为了调整起来方便，并且含义更加明确，对于界面中各类元素位置描述有一套居中外边距等属性的布局框架，在实现该部分内容会更为轻松，但布局框架同样是一个讨论起来费事费力且内容极多的部分，由于本项目只有小部分涉及界面布局若深入讨论布局框架则会耽误太多与主线任务无关的时间，在前面底层搭建阶段已经开辟足够多分枝了所以这种基于布局框架的界面元素定位暂时则不深入讨论。

注意在EasyX中，我们可以使用getwidth与getheight方法获取绘图窗口的宽度和高度，图片类内也提供了获取图片尺寸宽高的方法，由于图片渲染时描述图片位置坐标为图片矩形左上角，如果想让图片在窗口居中则需要在水平与竖直方向上将窗口尺寸和图片尺寸作差并除以二即可，on_enter初始化完成后就可以来到on_draw方法内部将图片内容渲染到对应位置上。

运行程序，正确进行了界面渲染则完成：

```
//全局区声明资源
#include "utils.h"

#include "sceneManager.h"

#include "animation.h"

extern IMAGE img_VS;
extern IMAGE img_1P;
extern IMAGE img_2P;
extern IMAGE img_1P_desc;
extern IMAGE img_2P_desc;
extern IMAGE img_select_background_left;
extern IMAGE img_select_background_right;
extern IMAGE img_selector_tip;
extern IMAGE img_selector_background;
extern IMAGE img_1P_selector_btn_idle_left;
extern IMAGE img_1P_selector_btn_idle_right;
extern IMAGE img_1P_selector_btn_down_left;
extern IMAGE img_1P_selector_btn_down_right;
extern IMAGE img_2P_selector_btn_idle_left;
extern IMAGE img_2P_selector_btn_idle_right;
extern IMAGE img_2P_selector_btn_down_left;
extern IMAGE img_2P_selector_btn_down_right;
extern IMAGE img_gamer1_selector_background_left;
extern IMAGE img_gamer1_selector_background_right;
extern IMAGE img_gamer2_selector_background_left;
extern IMAGE img_gamer2_selector_background_right;

extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer2_idle_right;

extern IMAGE img_avatar_gamer1;
extern IMAGE img_avatar_gamer2;

extern SceneManager scene_manager;

//SelectorScene私有成员变量
POINT pos_img_VS = { 0 };
POINT pos_img_tip = { 0 };
POINT pos_img_1P = { 0 };
POINT pos_img_2P = { 0 };
POINT pos_img_1P_desc = { 0 };
POINT pos_img_2P_desc = { 0 };
POINT pos_img_1P_name = { 0 };
POINT pos_img_2P_name = { 0 };
POINT pos_animation_1P = { 0 };
POINT pos_animation_2P = { 0 };
POINT pos_img_1P_select_background = { 0 };
POINT pos_img_2P_select_background = { 0 };
POINT pos_1P_selector_btn_left = { 0 };
POINT pos_2P_selector_btn_left = { 0 };
POINT pos_1P_selector_btn_right = { 0 };
POINT pos_2P_selector_btn_right = { 0 };

Animation m_animation_gamer1;
Animation m_animation_gamer2;

//编写on_enter方法初始化
this->m_animation_gamer1.setAtlas(&atlas_gamer1_die_right);
this->m_animation_gamer2.setAtlas(&atlas_gamer2_idle_right);
this->m_animation_gamer1.setInterval(100);
this->m_animation_gamer2.setInterval(100);

static const int OFFSET_X = 50;

this->pos_img_VS.x = (getwidth() - img_VS.getwidth()) / 2;
this->pos_img_VS.y = (getheight() - img_VS.getheight()) / 2;
this->pos_img_tip.x = (getwidth() - img_selector_tip.getwidth()) / 2;
this->pos_img_tip.y = getheight() - 125;
this->pos_img_1P.x = (getwidth() / 2 - img_1P.getwidth()) / 2 - OFFSET_X;
this->pos_img_1P.y = 35;
this->pos_img_2P.x = getwidth() / 2 + (getwidth() / 2 - img_2P.getwidth()) / 2 + OFFSET_X;
this->pos_img_2P.y = this->pos_img_1P.y;
this->pos_img_1P_desc.x = (getwidth() - img_1P_desc.getwidth()) / 2 - OFFSET_X;
this->pos_img_1P_desc.y = getheight() - 150;
this->pos_img_2P_desc.x = getwidth() / 2 + (getwidth() / 2 - img_2P_desc.getwidth()) / 2 + OFFSET_X;
this->pos_img_2P_desc.y = this->pos_img_1P_desc.y;
this->pos_img_1P_select_background.x = (getwidth() / 2 - img_select_background_right.getwidth()) / 2 - OFFSET_X;
this->pos_img_1P_select_background.y = this->pos_img_1P.y + img_1P.getwidth() + 35;
this->pos_img_1P_select_background.x = getwidth() / 2 + (getwidth() / 2 - img_select_background_left.getwidth()) / 2 + OFFSET_X;
this->pos_img_1P_select_background.y = this->pos_img_1P_select_background.y;
this->pos_animation_1P.x = (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 - OFFSET_X;
this->pos_animation_1P.y = this->pos_img_1P_select_background.y + 80;
this->pos_animation_2P.x = getwidth() / 2 + (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 + OFFSET_X;
this->pos_animation_2P.y = this->pos_animation_1P.y;
this->pos_img_1P_name.y = this->pos_animation_1P.y + 155;
this->pos_img_2P_name.y = this->pos_img_1P_name.y;
this->pos_1P_selector_btn_left.x = this->pos_img_1P_select_background.x - img_1P_selector_btn_idle_left.getwidth();
this->pos_1P_selector_btn_left.y = this->pos_img_1P_select_background.y + (img_select_background_right.getheight() - img_1P_selector_btn_idle_left.getheight()) / 2;
this->pos_1P_selector_btn_right.x = this->pos_img_1P_select_background.x + img_select_background_right.getwidth();
this->pos_1P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;
this->pos_2P_selector_btn_left.x = this->pos_img_2P_select_background.x - img_2P_selector_btn_idle_left.getwidth();
this->pos_2P_selector_btn_left.y = this->pos_1P_selector_btn_left.y;
this->pos_2P_selector_btn_right.x = this->pos_img_2P_select_background.x + img_select_background_left.getwidth();
this->pos_2P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;

//编写on_draw方法渲染
putimage(0, 0, &img_selector_background);
putImageAlpha(this->pos_img_VS.x, this->pos_img_VS.y, &img_VS);

putImageAlpha(this->pos_img_1P.x, this->pos_img_1P.y, &img_1P);
putImageAlpha(this->pos_img_2P.x, this->pos_img_2P.y, &img_2P);
putImageAlpha(this->pos_img_1P_select_background.x, this->pos_img_1P_select_background.y, &img_select_background_right);
putImageAlpha(this->pos_img_2P_select_background.x, this->pos_img_2P_select_background.y, &img_select_background_left);

putImageAlpha(this->pos_img_1P_desc.x, this->pos_img_1P_desc.y, &img_1P_desc);
putImageAlpha(this->pos_img_2P_desc.x, this->pos_img_2P_desc.y, &img_2P_desc);

putImageAlpha(this->pos_img_tip.x, this->pos_img_tip.y, &img_selector_tip);
```



## 第六节代码完成展示

**sceneManager.h**

```
#ifndef _SCENE_MANAGER_H_
#define _SCENE_MANAGER_H_

#include "scene.h"

extern Scene* menu_scene;
extern Scene* game_scene;
extern Scene* selector_scene;

class SceneManager
{
public:
	enum class SceneType
	{
		Menu,
		Game,
		Selector
	};

public:
	SceneManager() = default;
	~SceneManager() = default;

	void setCurrentState(Scene* scene)
	{
		this->m_current_scene = scene;
		this->m_current_scene->on_enter();
	}

	void switchTo(SceneType type)
	{
		this->m_current_scene->on_exit();
		switch (type)
		{
		case SceneManager::SceneType::Menu:
			this->m_current_scene = menu_scene;
			break;
		case SceneManager::SceneType::Game:
			this->m_current_scene = game_scene;
			break;
		case SceneManager::SceneType::Selector:
			this->m_current_scene = selector_scene;
			break;
		default:
			break;
		}
		this->m_current_scene->on_enter();
	}

	void on_updata(int delta)
	{
		this->m_current_scene->on_update(delta);
	}

	void on_draw(const Camera& camera)
	{
		this->m_current_scene->on_draw(camera);
	}

	void on_input(const ExMessage& msg)
	{
		this->m_current_scene->on_input(msg);
	}

public:
	Scene* m_current_scene = nullptr;

};

#endif
```

**gameScene.h**

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern SceneManager scene_manager;

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter() {}

	virtual void on_update(int delta) {}

	virtual void on_draw(const Camera& camera) {}

	virtual void on_input(const ExMessage& msg) {}

	virtual void on_exit() {}

private:

};

#endif
```

**menuScene.h**

```
#ifndef _MENU_SCENE_H_
#define _MENU_SCENE_H_

#include "scene.h"
#include "sceneManager.h"

extern SceneManager scene_manager;

extern IMAGE img_menu_background;

class MenuScene : public Scene
{
public:
	MenuScene() = default;
	~MenuScene() = default;

	virtual void on_enter()
	{
		mciSendString(L"play bgm_menu repeat from 0", NULL, 0, NULL);
	}

	virtual void on_update(int delta) {}

	virtual void on_draw(const Camera& camera)
	{
		putimage(0, 0, &img_menu_background);
	}

	virtual void on_input(const ExMessage& msg)
	{
		if (msg.message == WM_KEYUP)
		{
			mciSendString(L"play ui_confirm repeat from 0", NULL, 0, NULL);
			scene_manager.switchTo(SceneManager::SceneType::Selector);
		}
	}

	virtual void on_exit() {}

private:

};

#endif

```

**scene.h**

```
#ifndef _SCENE_H_
#define _SCENE_H_

#include "camera.h"

#include <graphics.h>

class Scene
{
public:
	Scene() = default;
	~Scene() = default;

	virtual void on_enter() {}
	virtual void on_update(int delta) {}
	virtual void on_draw(const Camera& camera) {}
	virtual void on_input(const ExMessage& msg) {}
	virtual void on_exit() {}

private:

};

#endif
```

**selectorScene.h**

```
#ifndef _SELECTOR_SCENE_H_
#define _SELECTOR_SCENE_H_

#include "utils.h"

#include "scene.h"
#include "sceneManager.h"

#include "animation.h"

extern IMAGE img_VS;
extern IMAGE img_1P;
extern IMAGE img_2P;
extern IMAGE img_1P_desc;
extern IMAGE img_2P_desc;
extern IMAGE img_select_background_left;
extern IMAGE img_select_background_right;
extern IMAGE img_selector_tip;
extern IMAGE img_selector_background;
extern IMAGE img_1P_selector_btn_idle_left;
extern IMAGE img_1P_selector_btn_idle_right;
extern IMAGE img_1P_selector_btn_down_left;
extern IMAGE img_1P_selector_btn_down_right;
extern IMAGE img_2P_selector_btn_idle_left;
extern IMAGE img_2P_selector_btn_idle_right;
extern IMAGE img_2P_selector_btn_down_left;
extern IMAGE img_2P_selector_btn_down_right;
extern IMAGE img_gamer1_selector_background_left;
extern IMAGE img_gamer1_selector_background_right;
extern IMAGE img_gamer2_selector_background_left;
extern IMAGE img_gamer2_selector_background_right;

extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer2_idle_right;

extern IMAGE img_avatar_gamer1;
extern IMAGE img_avatar_gamer2;

extern SceneManager scene_manager;

class SelectorScene : public Scene
{
public:
	SelectorScene() = default;
	~SelectorScene() = default;

	virtual void on_enter() 
	{
		this->m_animation_gamer1.setAtlas(&atlas_gamer1_idle_right);
		this->m_animation_gamer2.setAtlas(&atlas_gamer2_idle_right);
		this->m_animation_gamer1.setInterval(100);
		this->m_animation_gamer2.setInterval(100);

		static const int OFFSET_X = 50;

		this->pos_img_VS.x = (getwidth() - img_VS.getwidth()) / 2;
		this->pos_img_VS.y = (getheight() - img_VS.getheight()) / 2;
		this->pos_img_tip.x = (getwidth() - img_selector_tip.getwidth()) / 2;
		this->pos_img_tip.y = getheight() - 125;
		this->pos_img_1P.x = (getwidth() / 2 - img_1P.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P.y = 35;
		this->pos_img_2P.x = getwidth() / 2 + (getwidth() / 2 - img_2P.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P.y = this->pos_img_1P.y;
		this->pos_img_1P_desc.x = (getwidth() / 2 - img_1P_desc.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P_desc.y = getheight() - 150;
		this->pos_img_2P_desc.x = getwidth() / 2 + (getwidth() / 2 - img_2P_desc.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P_desc.y = this->pos_img_1P_desc.y;
		this->pos_img_1P_select_background.x = (getwidth() / 2 - img_select_background_right.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P_select_background.y = this->pos_img_1P.y + img_1P.getwidth() + 35;
		this->pos_img_2P_select_background.x = getwidth() / 2 + (getwidth() / 2 - img_select_background_left.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P_select_background.y = this->pos_img_1P_select_background.y;
		this->pos_animation_1P.x = (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 - OFFSET_X;
		this->pos_animation_1P.y = this->pos_img_1P_select_background.y + 80;
		this->pos_animation_2P.x = getwidth() / 2 + (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 + OFFSET_X;
		this->pos_animation_2P.y = this->pos_animation_1P.y;
		this->pos_img_1P_name.y = this->pos_animation_1P.y + 155;
		this->pos_img_2P_name.y = this->pos_img_1P_name.y;
		this->pos_1P_selector_btn_left.x = this->pos_img_1P_select_background.x - img_1P_selector_btn_idle_left.getwidth();
		this->pos_1P_selector_btn_left.y = this->pos_img_1P_select_background.y + (img_select_background_right.getheight() - img_1P_selector_btn_idle_left.getheight()) / 2;
		this->pos_1P_selector_btn_right.x = this->pos_img_1P_select_background.x + img_select_background_right.getwidth();
		this->pos_1P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;
		this->pos_2P_selector_btn_left.x = this->pos_img_2P_select_background.x - img_2P_selector_btn_idle_left.getwidth();
		this->pos_2P_selector_btn_left.y = this->pos_1P_selector_btn_left.y;
		this->pos_2P_selector_btn_right.x = this->pos_img_2P_select_background.x + img_select_background_left.getwidth();
		this->pos_2P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;
	}

	virtual void on_update(int delta) {}

	virtual void on_draw(const Camera& camera)
	{
		putimage(0, 0, &img_selector_background);
		putImageAlpha(this->pos_img_VS.x, this->pos_img_VS.y, &img_VS);

		putImageAlpha(this->pos_img_1P.x, this->pos_img_1P.y, &img_1P);
		putImageAlpha(this->pos_img_2P.x, this->pos_img_2P.y, &img_2P);
		putImageAlpha(this->pos_img_1P_select_background.x, this->pos_img_1P_select_background.y, &img_select_background_right);
		putImageAlpha(this->pos_img_2P_select_background.x, this->pos_img_2P_select_background.y, &img_select_background_left);

		putImageAlpha(this->pos_img_1P_desc.x, this->pos_img_1P_desc.y, &img_1P_desc);
		putImageAlpha(this->pos_img_2P_desc.x, this->pos_img_2P_desc.y, &img_2P_desc);

		putImageAlpha(this->pos_img_tip.x, this->pos_img_tip.y, &img_selector_tip);
	}

	virtual void on_input(const ExMessage& msg) {}

	virtual void on_exit() {}

private:
	POINT pos_img_VS = { 0 };
	POINT pos_img_tip = { 0 };
	POINT pos_img_1P = { 0 };
	POINT pos_img_2P = { 0 };
	POINT pos_img_1P_desc = { 0 };
	POINT pos_img_2P_desc = { 0 };
	POINT pos_img_1P_name = { 0 };
	POINT pos_img_2P_name = { 0 };
	POINT pos_animation_1P = { 0 };
	POINT pos_animation_2P = { 0 };
	POINT pos_img_1P_select_background = { 0 };
	POINT pos_img_2P_select_background = { 0 };
	POINT pos_1P_selector_btn_left = { 0 };
	POINT pos_2P_selector_btn_left = { 0 };
	POINT pos_1P_selector_btn_right = { 0 };
	POINT pos_2P_selector_btn_right = { 0 };

	Animation m_animation_gamer1;
	Animation m_animation_gamer2;

};

#endif
```



## 第七节

### 角色选择界面渲染

为了区分选择角色类型，首先在selectorScene.h中的SelectorScene类内声明枚举类，并在类内声明角色1和2与Invalid类，随后可在类内声明成员变量指定玩家所选角色类型：

```
//类内私有成员枚举类
private:
	enum class PlayerType
	{
		Gamer1,
		Gamer2,
		Invalid
	};
	
//类内成员变量
PlayerType m_player_type_1 = PlayerType::Gamer1;
PlayerType m_player_type_2 = PlayerType::Gamer2;

```



接下来可以准备将画面渲染在界面上，不过在此之前需要对现有代码进行小幅度跳转，既然后续渲染需要先获取摄像机位置并且此处逻辑在所有渲染动画时都需要使用，那么结合面向对象的封装特性，不如直接将获取摄像机位置并与自身坐标进行做差的逻辑直接放入Animation类中。

首先在animation.h中引入camera.h头文件，随后将Camera引入on_draw参数并注意到putImageAlpha在其他函数也进行了引用，在utils.h中提供一个使用摄像机进行渲染的重载，随后在selectorScene.h中对on_draw方法中添加根据不同游戏角色选择不同动画逻辑进行渲染，只不过需要注意渲染顺序以免图片覆盖的问题，并且要记得在on_update中。

```
//animation.h头文件引入文件
#include "camera.h"
#include <graphics.h>

//utils.h头文件中重载带摄像头的putImageAlpha
inline void putImageAlpha(const Camera& camera, int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), (int)(dst_x - camera.getPosition().m_x), (int)(dst_y - camera.getPosition().m_y), w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

//animation.h头文件中改写传入摄像机的渲染方法
void on_draw(const Camera& camera, int x, int y) const
{
	putImageAlpha(camera, x, y, this->m_atlas->getImage(this->m_idx_frame));
}

//selectorScene.h中改写on_draw渲染方法
virtual void on_draw(const Camera& camera)
{
	putimage(0, 0, &img_selector_background);
	putImageAlpha(this->pos_img_VS.x, this->pos_img_VS.y, &img_VS);

	putImageAlpha(this->pos_img_1P.x, this->pos_img_1P.y, &img_1P);
	putImageAlpha(this->pos_img_2P.x, this->pos_img_2P.y, &img_2P);
	putImageAlpha(this->pos_img_1P_select_background.x, this->pos_img_1P_select_background.y, &img_select_background_right);
	putImageAlpha(this->pos_img_2P_select_background.x, this->pos_img_2P_select_background.y, &img_select_background_left);

	switch (this->m_player_type_1)
	{
	case PlayerType::Gamer1:
		this->m_animation_gamer1.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
		break;
	case PlayerType::Gamer2:
		this->m_animation_gamer2.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
		break;
	}
	
	switch (this->m_player_type_2)
	{
	case PlayerType::Gamer1:
		this->m_animation_gamer1.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
		break;
	case PlayerType::Gamer2:
		this->m_animation_gamer2.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
		break;
	}

	putImageAlpha(this->pos_img_1P_desc.x, this->pos_img_1P_desc.y, &img_1P_desc);
	putImageAlpha(this->pos_img_2P_desc.x, this->pos_img_2P_desc.y, &img_2P_desc);

	putImageAlpha(this->pos_img_tip.x, this->pos_img_tip.y, &img_selector_tip);
}

//selectorScene.h中添加动画更新on_update方法
this->m_animation_gamer1.on_update(delta);
this->m_animation_gamer2.on_update(delta);
```



其次是角色文本角色名字符串图片，首先在私有成员中定义角色文本名字符串，接着在类内定义一个文本阴影效果文本的函数outtextxy_shaded其中outtextxy为EasyX提供的文本绘制方法，这里将文字颜色调低并移动3px使得字体带阴影呈现立体效果，最后是补全角色名绘图代码于on_draw的switch中，注意要先加载字体文件，于main.cpp文件中于main函数中于初始化窗口后设置字体样式为加载字体名同时设置文本背景色为透明：

```
//selectorScene.h中私有成员角色名变量
LPCTSTR str_gamer1_name = L" 角色 1 ";
LPCTSTR str_gamer2_name = L" 角色 2 ";

//SelectorScene私有成员函数
private:
void outtextxy_shaded(int x, int y, LPCTSTR str)
{
	settextcolor(RGB(45, 45, 45));
	outtextxy(x + 3, y + 3, str);
	settextcolor(RGB(255, 255, 255));
	outtextxy(x, y, str);
}

//selectorScene.h中修改on_draw方法中switch代码
switch (this->m_player_type_1)
{
case PlayerType::Gamer1:
	this->m_animation_gamer1.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
	this->pos_img_1P_name.x = this->pos_img_1P_select_background.x + (img_select_background_right.getwidth() - textwidth(this->str_gamer1_name)) / 2;
	this->outtextxy_shaded(this->pos_img_1P_name.x, this->pos_img_1P_name.y, this->str_gamer1_name);
	break;
case PlayerType::Gamer2:
	this->m_animation_gamer2.on_draw(camera, this->pos_animation_2P.x, this->pos_animation_2P.y);
	this->pos_img_1P_name.x = this->pos_img_1P_select_background.x + (img_select_background_right.getwidth() - textwidth(this->str_gamer2_name)) / 2;
	this->outtextxy_shaded(this->pos_img_1P_name.x, this->pos_img_1P_name.y, this->str_gamer2_name);
	break;
}

switch (this->m_player_type_2)
{
case PlayerType::Gamer1:
	this->m_animation_gamer1.on_draw(camera, this->pos_animation_2P.x, this->pos_animation_2P.y);
	this->pos_img_2P_name.x = this->pos_img_2P_select_background.x + (img_select_background_left.getwidth() - textwidth(this->str_gamer1_name)) / 2;
	this->outtextxy_shaded(this->pos_img_2P_name.x, this->pos_img_2P_name.y, this->str_gamer1_name);
	break;
case PlayerType::Gamer2:
	this->m_animation_gamer2.on_draw(camera, this->pos_animation_2P.x, this->pos_animation_2P.y);
	this->pos_img_2P_name.x = this->pos_img_2P_select_background.x + (img_select_background_left.getwidth() - textwidth(this->str_gamer2_name)) / 2;
	this->outtextxy_shaded(this->pos_img_2P_name.x, this->pos_img_2P_name.y, this->str_gamer2_name);
	break;
}

//main.cpp中添加字体
settextstyle(28, 0, L"HYPixel11pxU-2.ttf");
setbkmode(TRANSPARENT);
```



为了让画面加上更多动画效果让动画更加活跃，我们希望背景有一系列角色剪影水平滚动，且角色1背景剪影为角色2剪影，反之依然，且两图剪影都向界面中部进行滚动凸显中间的标志表现张力。

在素材包剪影中，直接提供了角色1&2的剪影背景图，也就是只需要这两张图片在画面上滚动即可，那么该如何让图片滚动起来？其中一种方法是渲染两次，假设存在一条扫描线，其左侧一张剪影右侧一张剪影只要扫描线从左侧到目的地再闪现到左侧，即可实现连续滚动特效。

首先selectorScene.h中选角场景类中私有成员中定义私有成员m_selector_background_scorll_offset_x背景板滚动距离，并在on_update中每次移动5px并当线条到达剪影宽度时就让线条重新回到原位，如此背景动态数据部分就完成了：

```
//selectorScene.h场景类私有成员变量
int m_selector_background_scorll_offset_x = 0;

//on_update更新方法变量移动
this->m_selector_background_scorll_offset_x += 5;
```



对于图片背景剪影，首先在SelectorScene类内on_draw开头声明两个图片指针分别指向角色1&2背后剪影图片对象，并根据type指向对应剪影，不过需要注意的是当线条移动时，一侧剪影不断变短另一侧不断变宽，也就是说需要对原始素材裁剪部分之后才能进行绘制，目前还无对图片进行裁剪的功能，所以在utils.h中为putImageAlpha再次提供一个可裁剪图片的重载版本，随后在selectorScene.h文件的场景类on_draw背景图绘制后添加剪影绘制方法，运行程序可以看到正常进行了渲染绘制：

```
//SelectorScene场景中on_draw方法增加指针与switch初始化方法
IMAGE* imgptr_P1_seletor_background = nullptr;
IMAGE* imgptr_P2_seletor_background = nullptr;

switch (this->m_player_type_1)
{
case PlayerType::Gamer1:
    imgptr_P1_seletor_background = &img_gamer1_selector_background_left;
    break;
case PlayerType::Gamer2:
    imgptr_P1_seletor_background = &img_gamer2_selector_background_left;
    break;
default:
    imgptr_P1_seletor_background = &img_gamer1_selector_background_left;
    break;
}

switch (this->m_player_type_2)
{
case PlayerType::Gamer1:
    imgptr_P2_seletor_background = &img_gamer1_selector_background_left;
    break;
case PlayerType::Gamer2:
    imgptr_P2_seletor_background = &img_gamer2_selector_background_left;
    break;
default:
    imgptr_P2_seletor_background = &img_gamer1_selector_background_left;
    break;
}

//utils.h文件提供存在裁剪putImageAlpha方法
inline void putImageAlpha(int dst_x, int dst_y, int width, int height, IMAGE* img, int src_x, int src_y)
{
	int w = width > 0 ? width : img->getwidth(), h = height > 0 ? height : img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), src_x, src_y, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

//selectorScene.h中on_draw中绘制背景后添加
putImageAlpha(this->m_selector_background_scorll_offset_x - imgptr_P1_seletor_background->getwidth(), 0, imgptr_P1_seletor_background);
putImageAlpha(this->m_selector_background_scorll_offset_x, 0, imgptr_P1_seletor_background->getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P1_seletor_background, 0, 0);
putImageAlpha(getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P2_seletor_background);
putImageAlpha(getwidth() - imgptr_P2_seletor_background->getwidth(), 0, imgptr_P2_seletor_background->getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P2_seletor_background, this->m_selector_background_scorll_offset_x, 0);
```



### 角色选择界面交互

选角界面提供了选角按钮，但是与一般按钮不同，这些按钮不会提供响应操作仅作为视觉提示功能，当己方按下对应按键时便可以切换角色选择。

来到selecorScene.h文件类内声明四个布尔，分别标记1P与2P向左向右按钮是否按下，随后在on_input中处理事件，通过两层switch对按键按下时的不同码值处理，并且为了符合直觉将按键响应移至按键抬起时，并进行音效播放的效果，最后在on_draw方法中添加按钮绘制方法，左右两个两人共计四个按钮渲染，运行程序即可看到按钮变化与切换不同角色的渲染：

```
//selectorScene.h文件SelectorScene类内成员变量
bool is_btn_1P_left_down = false;
bool is_btn_1P_right_down = false;
bool is_btn_2P_left_down = false;
bool is_btn_2P_right_down = false;

//selectorScene.h文件on_input成员函数方法
virtual void on_input(const ExMessage& msg)
{
	switch (msg.message)
	{
	case WM_KEYDOWN:
		switch (msg.vkcode)
		{
		case 0x41://'A'
			this->is_btn_1P_left_down = true;
			break;
		case 0x44://'D'
			this->is_btn_1P_right_down = true;
			break;
		case VK_LEFT://'←'
			this->is_btn_2P_left_down = true;
			break;
		case VK_RIGHT://'→'
			this->is_btn_2P_right_down = true;
			break;
		}
		break;
	case WM_KEYUP:
		switch (msg.vkcode)
		{
		case 0x41://'A'
			this->is_btn_1P_left_down = false;
			this->m_player_type_1 = (PlayerType)(((int)PlayerType::Invalid + (int)this->m_player_type_1 - 1) % (int)PlayerType::Invalid);
			mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
			break;
		case 0x44://'D'
			this->is_btn_1P_right_down = false;
			this->m_player_type_1 = (PlayerType)(((int)this->m_player_type_1 + 1) % (int)PlayerType::Invalid);
			mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
			break;
		case VK_LEFT://'←'
			this->is_btn_2P_left_down = false;
			this->m_player_type_2 = (PlayerType)(((int)PlayerType::Invalid + (int)this->m_player_type_2 - 1) % (int)PlayerType::Invalid);
			mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
			break;
		case VK_RIGHT://'→'
			this->is_btn_2P_right_down = false;
			this->m_player_type_2 = (PlayerType)(((int)this->m_player_type_2 + 1) % (int)PlayerType::Invalid);
			mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
			break;
		}
		break;
	default:
		break;
	}
}

//selectorScene.h文件on_draw成员函数方法
putImageAlpha(this->pos_1P_selector_btn_left.x, this->pos_1P_selector_btn_left.y, this->is_btn_1P_left_down ? &img_1P_selector_btn_down_left : &img_1P_selector_btn_idle_left);
putImageAlpha(this->pos_1P_selector_btn_right.x, this->pos_1P_selector_btn_right.y, this->is_btn_1P_right_down ? &img_1P_selector_btn_down_right : &img_1P_selector_btn_idle_right);
putImageAlpha(this->pos_2P_selector_btn_left.x, this->pos_2P_selector_btn_left.y, this->is_btn_2P_left_down ? &img_2P_selector_btn_down_left : &img_2P_selector_btn_idle_left);
putImageAlpha(this->pos_2P_selector_btn_right.x, this->pos_2P_selector_btn_right.y, this->is_btn_2P_right_down ? &img_2P_selector_btn_down_right : &img_2P_selector_btn_idle_right);
```



最后一个交互功能就是按下回车键后的功能，再次回到按键抬起时处理部分为switch添加回车条件分支，当回车抬起时通过场景管理器控制场景切换到游戏局内场景：

```
case VK_RETURN:
	scene_manager.switchTo(SceneManager::SceneType::Game);
	mciSendString(L"play ui_confirm from 0", NULL, 0, NULL);
	break;
```



## 第七节代码完成展示

**main.cpp**

```
#include "atlas.h"
#include "camera.h"

#include "scene.h"
#include "sceneManager.h"
#include "menuScene.h"
#include "gameScene.h"
#include "selectorScene.h"

#include "utils.h"

#pragma comment(lib, "Winmm.lib")

#include <graphics.h>

const int FPS = 60;

Camera main_camera;

IMAGE img_menu_background;					//主菜单背景图片

IMAGE img_VS;								//VS 艺术字图片
IMAGE img_1P;								//1P 文本图片
IMAGE img_2P;								//2P 文本图片
IMAGE img_1P_desc;							//1P 键位描述图片
IMAGE img_2P_desc;							//2P 键位描述图片
IMAGE img_select_background_left;			//选人朝左背景图片
IMAGE img_select_background_right;			//选人朝右背景图片
IMAGE img_selector_tip;						//选人界面提示信息
IMAGE img_selector_background;				//选人界面背景图
IMAGE img_1P_selector_btn_idle_left;		//1P 向左选择按钮默认状态图片
IMAGE img_1P_selector_btn_idle_right;		//1P 向右选择按钮默认状态图片
IMAGE img_1P_selector_btn_down_left;		//1P 向左选择按钮按下状态图片
IMAGE img_1P_selector_btn_down_right;		//1P 向右选择按钮按下状态图片
IMAGE img_2P_selector_btn_idle_left;		//2P 向左选择按钮默认状态图片
IMAGE img_2P_selector_btn_idle_right;		//2P 向右选择按钮默认状态图片
IMAGE img_2P_selector_btn_down_left;		//2P 向左选择按钮按下状态图片
IMAGE img_2P_selector_btn_down_right;		//2P 向右选择按钮按下状态图片
IMAGE img_gamer1_selector_background_left;	//选人界面类型1朝左背景图片
IMAGE img_gamer1_selector_background_right;	//选人界面类型1朝右背景图片
IMAGE img_gamer2_selector_background_left;	//选人界面类型2朝左背景图片
IMAGE img_gamer2_selector_background_right;	//选人界面类型2朝右背景图片

IMAGE img_sky;								//填空图片
IMAGE img_hills;							//山脉图片
IMAGE img_platform_large;					//大型平台图片
IMAGE img_platform_small;					//小型平台图片

IMAGE img_1P_cursor;						//1P 指示光标图片
IMAGE img_2P_cursor;						//2P 指示光标图片

Atlas atlas_gamer1_idle_left;				//类型1向左默认动画图集
Atlas atlas_gamer1_idle_right;				//类型1向右默认动画图集
Atlas atlas_gamer1_run_left;				//类型1向左奔跑动画图集
Atlas atlas_gamer1_run_right;				//类型1向右奔跑动画图集
Atlas atlas_gamer1_attack_ex_left;			//类型1向左特殊攻击动画图集
Atlas atlas_gamer1_attack_ex_right;			//类型1向右特殊攻击动画图集
Atlas atlas_gamer1_die_left;				//类型1向左死亡动画图集
Atlas atlas_gamer1_die_right;				//类型1向右死亡动画图集

Atlas atlas_gamer2_idle_left;				//类型2向左默认动画图集
Atlas atlas_gamer2_idle_right;				//类型2向右默认动画图集
Atlas atlas_gamer2_run_left;				//类型2向左奔跑动画图集
Atlas atlas_gamer2_run_right;				//类型2向右奔跑动画图集
Atlas atlas_gamer2_attack_ex_left;			//类型2向左特殊攻击动画图集
Atlas atlas_gamer2_attack_ex_right;			//类型2向右特殊攻击动画图集
Atlas atlas_gamer2_die_left;				//类型2向左死亡动画图集
Atlas atlas_gamer2_die_right;				//类型2向右死亡动画图集

IMAGE img_gamer1_bullet;					//类型1子弹图片
Atlas atlas_gamer1_bullet_break;			//类型1子弹破碎动画图集
Atlas atlas_gemer2_bullet;					//类型2子弹动画图集
Atlas atlas_gemer2_bullet_explode;			//类型2子弹爆炸动画图集
Atlas atlas_gamer2_bullet_ex;				//类型2特殊类型子弹动画图集
Atlas atlas_gamer2_bullet_ex_explode;		//类型2特殊类型子弹爆炸动画图集
Atlas atlas_gamer2_bullet_text;				//类型2特殊类型子弹爆炸文本动画图集

Atlas atlas_run_effect;						//奔跑特效动画图集
Atlas atlas_jump_effect;					//跳跃特效动画图集
Atlas atlas_land_effect;					//落地特效动画图集

IMAGE img_winner_bar;						//获胜玩家背景图片
IMAGE img_1P_winner;						//1P 获胜文本图片
IMAGE img_2P_winner;						//2P 获胜文本图片

IMAGE img_avatar_gamer1;					//类型1头像图片
IMAGE img_avatar_gamer2;					//类型2头像图片

Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;
Scene* selector_scene = nullptr;

SceneManager scene_manager;

void flipAtlas(Atlas& src, Atlas& dst)
{
	dst.clear();
	for (int i = 0; i < src.getSize(); i++)
	{
		IMAGE img_flpipped;
		flipImage(src.getImage(i), &img_flpipped);
		dst.addImage(img_flpipped);
	}
}

void loadGameResources()
{
	AddFontResourceEx(L"./resources/HYPixel11pxU-2.ttf", FR_PRIVATE, NULL);

	loadimage(&img_menu_background, L"./resources/menu_background.png");

	loadimage(&img_VS, L"./resources/VS.png");
	loadimage(&img_1P, L"./resources/1P.png");
	loadimage(&img_2P, L"./resources/2P.png");
	loadimage(&img_1P_desc, L"./resources/1P_desc.png");
	loadimage(&img_2P_desc, L"./resources/2P_desc.png");
	loadimage(&img_select_background_right, L"./resources/select_background.png");
	flipImage(&img_select_background_right, &img_select_background_left);
	loadimage(&img_selector_tip, L"./resources/selector_tip.png");
	loadimage(&img_selector_background, L"./resources/selector_background.png");
	loadimage(&img_1P_selector_btn_idle_right, L"./resources/1P_selector_btn_idle.png");
	flipImage(&img_1P_selector_btn_idle_right, &img_1P_selector_btn_idle_left);
	loadimage(&img_1P_selector_btn_down_right, L"./resources/1P_selector_btn_down.png");
	flipImage(&img_1P_selector_btn_down_right, &img_1P_selector_btn_down_left);
	loadimage(&img_2P_selector_btn_idle_right, L"./resources/2P_selector_btn_idle.png");
	flipImage(&img_2P_selector_btn_idle_right, &img_2P_selector_btn_idle_left);
	loadimage(&img_2P_selector_btn_down_right, L"./resources/2P_selector_btn_down.png");
	flipImage(&img_2P_selector_btn_down_right, &img_2P_selector_btn_down_left);
	loadimage(&img_gamer1_selector_background_right, L"./resources/gamer1_selector_background.png");
	flipImage(&img_gamer1_selector_background_right, &img_gamer1_selector_background_left);
	loadimage(&img_gamer2_selector_background_right, L"./resources/gamer2_selector_background.png");
	flipImage(&img_gamer2_selector_background_right, &img_gamer2_selector_background_left);

	loadimage(&img_sky, L"./resources/sky.png");
	loadimage(&img_hills, L"./resources/hills.png");
	loadimage(&img_platform_large, L"./resources/platform_large.png");
	loadimage(&img_platform_small, L"./resources/platform_small.png");

	loadimage(&img_1P_cursor, L"./resources/1P_cursor.png");
	loadimage(&img_2P_cursor, L"./resources/2P_cursor.png");

	atlas_gamer1_idle_right.loadFromFile(L"./resources/gamer1_idle_%d.png", 9);
	flipAtlas(atlas_gamer1_idle_right, atlas_gamer1_idle_left);
	atlas_gamer1_run_right.loadFromFile(L"./resources/gamer1_run_%d.png", 5);
	flipAtlas(atlas_gamer1_run_right, atlas_gamer1_run_left);
	atlas_gamer1_attack_ex_right.loadFromFile(L"./resources/gamer1_attack_ex_%d.png", 3);
	flipAtlas(atlas_gamer1_attack_ex_right, atlas_gamer1_attack_ex_left);
	atlas_gamer1_die_right.loadFromFile(L"./resources/gamer1_die_%d.png", 4);
	flipAtlas(atlas_gamer1_die_right, atlas_gamer1_die_left);

	atlas_gamer2_idle_right.loadFromFile(L"./resources/gamer2_idle_%d.png", 8);
	flipAtlas(atlas_gamer2_idle_right, atlas_gamer2_idle_left);
	atlas_gamer2_run_right.loadFromFile(L"./resources/gamer2_run_%d.png", 5);
	flipAtlas(atlas_gamer2_run_right, atlas_gamer2_run_left);
	atlas_gamer2_attack_ex_right.loadFromFile(L"./resources/gamer2_attack_ex_%d.png", 9);
	flipAtlas(atlas_gamer2_attack_ex_right, atlas_gamer2_attack_ex_left);
	atlas_gamer2_die_right.loadFromFile(L"./resources/gamer2_die_%d.png", 2);
	flipAtlas(atlas_gamer2_die_right, atlas_gamer2_die_left);

	loadimage(&img_gamer1_bullet, L"./resources/gamer1_bullet.png");
	atlas_gamer1_bullet_break.loadFromFile(L"./resources/gamer1_bullet_break_%d.png", 3);
	atlas_gemer2_bullet.loadFromFile(L"./resources/gamer2_bullet_%d.png", 5);
	atlas_gemer2_bullet_explode.loadFromFile(L"./resources/gamer2_bullet_explode_%d.png", 5);
	atlas_gamer2_bullet_ex.loadFromFile(L"./resources/gamer2_bullet_ex_%d.png", 5);
	atlas_gamer2_bullet_ex_explode.loadFromFile(L"./resources/gamer2_bullet_ex_explode_%d.png", 5);
	atlas_gamer2_bullet_text.loadFromFile(L"./resources/gamer2_bullet_text_%d.png", 6);

	atlas_run_effect.loadFromFile(L"./resources/run_effect_%d.png", 4);
	atlas_jump_effect.loadFromFile(L"./resources/jump_effect_%d.png", 5);
	atlas_land_effect.loadFromFile(L"./resources/land_effect_%d.png", 2);

	loadimage(&img_1P_winner, L"./resources/1P_winner.png");
	loadimage(&img_2P_winner, L"./resources/2P_winner.png");
	loadimage(&img_winner_bar, L"./resources/winner_bar.png");

	loadimage(&img_avatar_gamer1, L"./resources/avatar_gamer1.png");
	loadimage(&img_avatar_gamer2, L"./resources/avatar_gamer2.png");

	mciSendString(L"open ./resources/bgm_game.mp3 alias bgm_game", NULL, 0, NULL);
	mciSendString(L"open ./resources/bgm_menu.mp3 alias bgm_menu", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_1.mp3 alias gamer1_bullet_break_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_2.mp3 alias gamer1_bullet_break_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_3.mp3 alias gamer1_bullet_break_3", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_1.mp3 alias gamer1_bullet_shoot_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_2.mp3 alias gamer1_bullet_shoot_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_ex.mp3 alias gamer1_bullet_shoot_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode.mp3 alias gamer2_bullet_explode", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode_ex.mp3 alias gamer2_bullet_explode_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_text.mp3 alias gamer2_bullet_text", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_confirm.wav alias ui_confirm", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_switch.wav alias ui_switch", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_win.wav alias ui_win", NULL, 0, NULL);

	return;
}

int main()
{
	ExMessage msg;

	loadGameResources();
	
	initgraph(1200, 720);

	menu_scene = new MenuScene();
	game_scene = new GameScene();
	selector_scene = new SelectorScene();

	scene_manager.setCurrentState(menu_scene);

	settextstyle(28, 0, L"HYPixel11pxU-2.ttf");
	setbkmode(TRANSPARENT);

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene_manager.on_input(msg);
		}

		static DWORD last_tick_time = GetTickCount();
		DWORD current_tick_time = GetTickCount();
		DWORD delta_tick_time = current_tick_time - last_tick_time;
		scene_manager.on_updata(delta_tick_time);
		last_tick_time = current_tick_time;

		cleardevice();
		scene_manager.on_draw(main_camera);

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```

**selectorScene.h**

```
#ifndef _SELECTOR_SCENE_H_
#define _SELECTOR_SCENE_H_

#include "utils.h"

#include "scene.h"
#include "sceneManager.h"

#include "animation.h"

extern IMAGE img_VS;
extern IMAGE img_1P;
extern IMAGE img_2P;
extern IMAGE img_1P_desc;
extern IMAGE img_2P_desc;
extern IMAGE img_select_background_left;
extern IMAGE img_select_background_right;
extern IMAGE img_selector_tip;
extern IMAGE img_selector_background;
extern IMAGE img_1P_selector_btn_idle_left;
extern IMAGE img_1P_selector_btn_idle_right;
extern IMAGE img_1P_selector_btn_down_left;
extern IMAGE img_1P_selector_btn_down_right;
extern IMAGE img_2P_selector_btn_idle_left;
extern IMAGE img_2P_selector_btn_idle_right;
extern IMAGE img_2P_selector_btn_down_left;
extern IMAGE img_2P_selector_btn_down_right;
extern IMAGE img_gamer1_selector_background_left;
extern IMAGE img_gamer1_selector_background_right;
extern IMAGE img_gamer2_selector_background_left;
extern IMAGE img_gamer2_selector_background_right;

extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer2_idle_right;

extern IMAGE img_avatar_gamer1;
extern IMAGE img_avatar_gamer2;

extern SceneManager scene_manager;

class SelectorScene : public Scene
{
public:
	SelectorScene() = default;
	~SelectorScene() = default;

	virtual void on_enter() 
	{
		this->m_animation_gamer1.setAtlas(&atlas_gamer1_idle_right);
		this->m_animation_gamer2.setAtlas(&atlas_gamer2_idle_right);
		this->m_animation_gamer1.setInterval(100);
		this->m_animation_gamer2.setInterval(100);

		static const int OFFSET_X = 50;

		this->pos_img_VS.x = (getwidth() - img_VS.getwidth()) / 2;
		this->pos_img_VS.y = (getheight() - img_VS.getheight()) / 2;
		this->pos_img_tip.x = (getwidth() - img_selector_tip.getwidth()) / 2;
		this->pos_img_tip.y = getheight() - 125;
		this->pos_img_1P.x = (getwidth() / 2 - img_1P.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P.y = 35;
		this->pos_img_2P.x = getwidth() / 2 + (getwidth() / 2 - img_2P.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P.y = this->pos_img_1P.y;
		this->pos_img_1P_desc.x = (getwidth() / 2 - img_1P_desc.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P_desc.y = getheight() - 150;
		this->pos_img_2P_desc.x = getwidth() / 2 + (getwidth() / 2 - img_2P_desc.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P_desc.y = this->pos_img_1P_desc.y;
		this->pos_img_1P_select_background.x = (getwidth() / 2 - img_select_background_right.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P_select_background.y = this->pos_img_1P.y + img_1P.getwidth() + 35;
		this->pos_img_2P_select_background.x = getwidth() / 2 + (getwidth() / 2 - img_select_background_left.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P_select_background.y = this->pos_img_1P_select_background.y;
		this->pos_animation_1P.x = (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 - OFFSET_X;
		this->pos_animation_1P.y = this->pos_img_1P_select_background.y + 80;
		this->pos_animation_2P.x = getwidth() / 2 + (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 + OFFSET_X;
		this->pos_animation_2P.y = this->pos_animation_1P.y;
		this->pos_img_1P_name.y = this->pos_animation_1P.y + 155;
		this->pos_img_2P_name.y = this->pos_img_1P_name.y;
		this->pos_1P_selector_btn_left.x = this->pos_img_1P_select_background.x - img_1P_selector_btn_idle_left.getwidth();
		this->pos_1P_selector_btn_left.y = this->pos_img_1P_select_background.y + (img_select_background_right.getheight() - img_1P_selector_btn_idle_left.getheight()) / 2;
		this->pos_1P_selector_btn_right.x = this->pos_img_1P_select_background.x + img_select_background_right.getwidth();
		this->pos_1P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;
		this->pos_2P_selector_btn_left.x = this->pos_img_2P_select_background.x - img_2P_selector_btn_idle_left.getwidth();
		this->pos_2P_selector_btn_left.y = this->pos_1P_selector_btn_left.y;
		this->pos_2P_selector_btn_right.x = this->pos_img_2P_select_background.x + img_select_background_left.getwidth();
		this->pos_2P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;
	}

	virtual void on_update(int delta)
	{
		this->m_animation_gamer1.on_update(delta);
		this->m_animation_gamer2.on_update(delta);

		this->m_selector_background_scorll_offset_x += 5;
		if (this->m_selector_background_scorll_offset_x >= img_gamer1_selector_background_left.getwidth())
		{
			this->m_selector_background_scorll_offset_x -= img_gamer1_selector_background_left.getwidth();
		}
	}

	virtual void on_draw(const Camera& camera)
	{
		IMAGE* imgptr_P1_seletor_background = nullptr;
		IMAGE* imgptr_P2_seletor_background = nullptr;

		switch (this->m_player_type_1)
		{
		case PlayerType::Gamer1:
			imgptr_P1_seletor_background = &img_gamer1_selector_background_left;
			break;
		case PlayerType::Gamer2:
			imgptr_P1_seletor_background = &img_gamer2_selector_background_left;
			break;
		default:
			imgptr_P1_seletor_background = &img_gamer1_selector_background_left;
			break;
		}

		switch (this->m_player_type_2)
		{
		case PlayerType::Gamer1:
			imgptr_P2_seletor_background = &img_gamer1_selector_background_left;
			break;
		case PlayerType::Gamer2:
			imgptr_P2_seletor_background = &img_gamer2_selector_background_left;
			break;
		default:
			imgptr_P2_seletor_background = &img_gamer1_selector_background_left;
			break;
		}

		putimage(0, 0, &img_selector_background);

		putImageAlpha(this->m_selector_background_scorll_offset_x - imgptr_P1_seletor_background->getwidth(), 0, imgptr_P1_seletor_background);
		putImageAlpha(this->m_selector_background_scorll_offset_x, 0, imgptr_P1_seletor_background->getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P1_seletor_background, 0, 0);
		putImageAlpha(getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P2_seletor_background);
		putImageAlpha(getwidth() - imgptr_P2_seletor_background->getwidth(), 0, imgptr_P2_seletor_background->getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P2_seletor_background, this->m_selector_background_scorll_offset_x, 0);

		putImageAlpha(this->pos_img_VS.x, this->pos_img_VS.y, &img_VS);

		putImageAlpha(this->pos_img_1P.x, this->pos_img_1P.y, &img_1P);
		putImageAlpha(this->pos_img_2P.x, this->pos_img_2P.y, &img_2P);
		putImageAlpha(this->pos_img_1P_select_background.x, this->pos_img_1P_select_background.y, &img_select_background_right);
		putImageAlpha(this->pos_img_2P_select_background.x, this->pos_img_2P_select_background.y, &img_select_background_left);

		switch (this->m_player_type_1)
		{
		case PlayerType::Gamer1:
			this->m_animation_gamer1.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
			this->pos_img_1P_name.x = this->pos_img_1P_select_background.x + (img_select_background_right.getwidth() - textwidth(this->str_gamer1_name)) / 2;
			this->outtextxy_shaded(this->pos_img_1P_name.x, this->pos_img_1P_name.y, this->str_gamer1_name);
			break;
		case PlayerType::Gamer2:
			this->m_animation_gamer2.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
			this->pos_img_1P_name.x = this->pos_img_1P_select_background.x + (img_select_background_right.getwidth() - textwidth(this->str_gamer2_name)) / 2;
			this->outtextxy_shaded(this->pos_img_1P_name.x, this->pos_img_1P_name.y, this->str_gamer2_name);
			break;
		}
		
		switch (this->m_player_type_2)
		{
		case PlayerType::Gamer1:
			this->m_animation_gamer1.on_draw(camera, this->pos_animation_2P.x, this->pos_animation_2P.y);
			this->pos_img_2P_name.x = this->pos_img_2P_select_background.x + (img_select_background_left.getwidth() - textwidth(this->str_gamer1_name)) / 2;
			this->outtextxy_shaded(this->pos_img_2P_name.x, this->pos_img_2P_name.y, this->str_gamer1_name);
			break;
		case PlayerType::Gamer2:
			this->m_animation_gamer2.on_draw(camera, this->pos_animation_2P.x, this->pos_animation_2P.y);
			this->pos_img_2P_name.x = this->pos_img_2P_select_background.x + (img_select_background_left.getwidth() - textwidth(this->str_gamer2_name)) / 2;
			this->outtextxy_shaded(this->pos_img_2P_name.x, this->pos_img_2P_name.y, this->str_gamer2_name);
			break;
		}

		putImageAlpha(this->pos_1P_selector_btn_left.x, this->pos_1P_selector_btn_left.y, this->is_btn_1P_left_down ? &img_1P_selector_btn_down_left : &img_1P_selector_btn_idle_left);
		putImageAlpha(this->pos_1P_selector_btn_right.x, this->pos_1P_selector_btn_right.y, this->is_btn_1P_right_down ? &img_1P_selector_btn_down_right : &img_1P_selector_btn_idle_right);
		putImageAlpha(this->pos_2P_selector_btn_left.x, this->pos_2P_selector_btn_left.y, this->is_btn_2P_left_down ? &img_2P_selector_btn_down_left : &img_2P_selector_btn_idle_left);
		putImageAlpha(this->pos_2P_selector_btn_right.x, this->pos_2P_selector_btn_right.y, this->is_btn_2P_right_down ? &img_2P_selector_btn_down_right : &img_2P_selector_btn_idle_right);

		putImageAlpha(this->pos_img_1P_desc.x, this->pos_img_1P_desc.y, &img_1P_desc);
		putImageAlpha(this->pos_img_2P_desc.x, this->pos_img_2P_desc.y, &img_2P_desc);

		putImageAlpha(this->pos_img_tip.x, this->pos_img_tip.y, &img_selector_tip);
	}

	virtual void on_input(const ExMessage& msg)
	{
		switch (msg.message)
		{
		case WM_KEYDOWN:
			switch (msg.vkcode)
			{
			case 0x41://'A'
				this->is_btn_1P_left_down = true;
				break;
			case 0x44://'D'
				this->is_btn_1P_right_down = true;
				break;
			case VK_LEFT://'←'
				this->is_btn_2P_left_down = true;
				break;
			case VK_RIGHT://'→'
				this->is_btn_2P_right_down = true;
				break;
			}
			break;
		case WM_KEYUP:
			switch (msg.vkcode)
			{
			case 0x41://'A'
				this->is_btn_1P_left_down = false;
				this->m_player_type_1 = (PlayerType)(((int)PlayerType::Invalid + (int)this->m_player_type_1 - 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case 0x44://'D'
				this->is_btn_1P_right_down = false;
				this->m_player_type_1 = (PlayerType)(((int)this->m_player_type_1 + 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case VK_LEFT://'←'
				this->is_btn_2P_left_down = false;
				this->m_player_type_2 = (PlayerType)(((int)PlayerType::Invalid + (int)this->m_player_type_2 - 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case VK_RIGHT://'→'
				this->is_btn_2P_right_down = false;
				this->m_player_type_2 = (PlayerType)(((int)this->m_player_type_2 + 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case VK_RETURN:
				scene_manager.switchTo(SceneManager::SceneType::Game);
				mciSendString(L"play ui_confirm from 0", NULL, 0, NULL);
				break;
			}
			break;
		default:
			break;
		}
	}

	virtual void on_exit() {}

private:
	void outtextxy_shaded(int x, int y, LPCTSTR str)
	{
		settextcolor(RGB(45, 45, 45));
		outtextxy(x + 3, y + 3, str);
		settextcolor(RGB(255, 255, 255));
		outtextxy(x, y, str);
	}

private:
	enum class PlayerType
	{
		Gamer1,
		Gamer2,
		Invalid
	};

private:
	bool is_btn_1P_left_down = false;
	bool is_btn_1P_right_down = false;
	bool is_btn_2P_left_down = false;
	bool is_btn_2P_right_down = false;

private:
	POINT pos_img_VS = { 0 };
	POINT pos_img_tip = { 0 };
	POINT pos_img_1P = { 0 };
	POINT pos_img_2P = { 0 };
	POINT pos_img_1P_desc = { 0 };
	POINT pos_img_2P_desc = { 0 };
	POINT pos_img_1P_name = { 0 };
	POINT pos_img_2P_name = { 0 };
	POINT pos_animation_1P = { 0 };
	POINT pos_animation_2P = { 0 };
	POINT pos_img_1P_select_background = { 0 };
	POINT pos_img_2P_select_background = { 0 };
	POINT pos_1P_selector_btn_left = { 0 };
	POINT pos_2P_selector_btn_left = { 0 };
	POINT pos_1P_selector_btn_right = { 0 };
	POINT pos_2P_selector_btn_right = { 0 };

	Animation m_animation_gamer1;
	Animation m_animation_gamer2;

	PlayerType m_player_type_1 = PlayerType::Gamer1;
	PlayerType m_player_type_2 = PlayerType::Gamer2;

	LPCTSTR str_gamer1_name = L" 角色 1 ";
	LPCTSTR str_gamer2_name = L" 角色 2 ";

	int m_selector_background_scorll_offset_x = 0;

};

#endif
```

**animation.h**

```
#ifndef _ANIMATION_H_
#define _ANIMATION_H_

#include "atlas.h"
#include "utils.h"

#include "camera.h"
#include <graphics.h>
#include <functional>

class Animation
{
public:
	Animation() = default;
	~Animation() = default;

	void reset()
	{
		this->m_timer = 0;
		this->m_idx_frame = 0;
	}

	void setAtlas(Atlas* new_atlas)
	{
		this->reset();
		this->m_atlas = new_atlas;
	}

	void setLoop(bool is_loop)
	{
		this->is_loop = is_loop;
	}

	void setInterval(int ms)
	{
		this->m_interval = ms;
	}

	int getIndexFrame()
	{
		return this->m_idx_frame;
	}

	IMAGE* getFrame()
	{
		return this->m_atlas->getImage(this->m_idx_frame);
	}

	bool checkFinished()
	{
		if (this->is_loop) return false;

		return this->m_idx_frame == this->m_atlas->getSize() - 1;
	}

	void setCallBack(std::function<void()> callback)
	{
		this->m_callback = callback;
	}

	void on_update(int delta)
	{
		this->m_timer += delta;
		if (this->m_timer >= this->m_interval)
		{
			this->m_timer = 0;
			this->m_idx_frame++;
			if (this->m_idx_frame >= this->m_atlas->getSize())
			{
				this->m_idx_frame = (this->is_loop ? 0 : this->m_atlas->getSize() - 1);
				if (!this->is_loop && this->m_callback)
				{
					this->m_callback();
				}
			}
		}
	}

	void on_draw(const Camera& camera, int x, int y) const
	{
		putImageAlpha(camera, x, y, this->m_atlas->getImage(this->m_idx_frame));
	}

private:
	int m_timer = 0;
	int m_interval = 0;
	int m_idx_frame = 0;

	bool is_loop = true;

	Atlas* m_atlas = nullptr;

	std::function<void()> m_callback;

};

#endif
```

**utils.h**

```
#ifndef _UTILS_H_
#define _UTILS_H_

#pragma comment(lib, "MSIMG32.LIB")

#include <graphics.h>

inline void putImageAlpha(int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void putImageAlpha(const Camera& camera, int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), (int)(dst_x - camera.getPosition().m_x), (int)(dst_y - camera.getPosition().m_y), w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void putImageAlpha(int dst_x, int dst_y, int width, int height, IMAGE* img, int src_x, int src_y)
{
	int w = width > 0 ? width : img->getwidth(), h = height > 0 ? height : img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), src_x, src_y, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void flipImage(IMAGE* src, IMAGE* dst)
{
	int w = src->getwidth(), h = src->getheight();
	Resize(dst, w, h);
	
	DWORD* src_buffer = GetImageBuffer(src);
	DWORD* dst_buffer = GetImageBuffer(dst);
	for (int i = 0; i < h; i++)
	{
		for (int j = 0; j < w; j++)
		{
			int src_idx = i * w + j, dst_idx = (i + 1) * w - j - 1;
			dst_buffer[dst_idx] = src_buffer[src_idx];
		}
	}
	return;
}

#endif
```



## 第八节

### 物理模拟引入

当我们在游戏中引入物理引擎的时候，牛顿就称为了整个游戏世界的导演。

游戏作品能否带给玩家以沉浸感很大程度取决于游戏中各类交互反馈是否符合玩家直觉，起跳后一段时间会落下，抛射物体会收重力落回地面，物理的模拟就是让世界的种种反馈尽可能区逼近显示存在。

### 局内场景界面绘制

首先来到gameScene.h文件中引入素材资源，并在GameScene中声明资源对应坐标，并在on_enter中初始化他们位置，由于为了摄像头抖动不显示黑边所以提供背景尺寸将会略大于窗口尺寸，并在on_draw中使用定义好的putImageAlpha方法渲染背景图片，运行程序正常看到背景即可：

```
//gameScene.h全局区引入资源
#include "utils.h"

extern IMAGE img_sky;
extern IMAGE img_hills;
extern IMAGE img_platform_large;
extern IMAGE img_platform_small;

extern Camera main_camera;

//GameScene成员变量声明
POINT pos_img_sky = { 0 };
POINT pos_img_hills = { 0 };

//GameScene成员函数on_enter
this->pos_img_sky.x = (getwidth() - img_sky.getwidth()) / 2;
this->pos_img_sky.y = (getheight() - img_sky.getheight()) / 2;

this->pos_img_hills.x = (getwidth() - img_hills.getwidth()) / 2;
this->pos_img_hills.y = (getheight() - img_hills.getheight()) / 2;

//GameScene成员函数on_draw
putImageAlpha(camera, this->pos_img_sky.x, this->pos_img_sky.y, &img_sky);
putImageAlpha(camera, this->pos_img_hills.x, this->pos_img_hills.y, &img_hills);
```



### 简单物理实现——平台

接下来就可以实现简单的物理效果了，本项目较新的的碰撞效果"重力"效果，也就是在虚空内会受重力影响不断地受重力影响不断向下坠落，直到到达地面（或者摔死了>D<），也就是模拟重力的效果可以从悬浮空中的下坠和到达地面的停止，而关于地面也是相当抽象的概念。

在平台游戏中玩家可踩踏的对象，可以是游戏最下方的地面，也可以是箱子或道具，甚至是敌人或玩家，而在本项目中只考虑最简单的情况即玩家可落到"平台"上，所以我们可以将平台对象定义为类，但是我们也要思考应该使用什么样的几何图形来拟合平台碰撞区域，可能我们会第一时间想到矩形，但是要明确一点的是在游戏开发代码编写过程中，我们只需要让程序所展示出来的功能符合游戏逻辑即可，不必要的要求像显示一样对其进行一比一复刻。

所以也需要思考游戏平台是否有更好的设计思路，由于此类2D视角缺失了深度这一维度轴，所以对于此类游戏平台大多被设计为了单向碰撞，也就是玩家从下方可以正常穿过，从上方可以坠落到平台上，所以矩形碰撞箱就没有太大必要了，要关注的点实际上是平台对象的"地面"在哪，于是这种平台我们可以抽象成一条线。

所以代码方面，首先创建platform.h头文件定义Plantform类，在类内定义结构体CollisionShape表示碰撞外形，并在其中声明三个变量：高度，左侧点右侧点即可描述一条线最后在类内定义碰撞外形，添加IMAGE指针做渲染对象以及渲染对象坐标（碰撞位置与图片位置通常不一致，所以此处需要额外声明），引入绘图逻辑所需头文件，并声明on_draw方法使用camera在其中传递渲染出平台：

```
#ifndef _PLATFORM_H_
#define _PLATFORM_H_

#include "utils.h"
#include "camera.h"

class Platform
{
public:
	Platform() = default;
	~Platform() = default;

	void on_draw(const Camera& camera) const
	{
		putImageAlpha(this->m_render_position.x, this->m_render_position.y, this->m_img);
	}

public:
	struct CollisionShape
	{
		float y;
		float left, right;
	};

public:
	CollisionShape m_shape;

	IMAGE* m_img = nullptr;
	POINT m_render_position = { 0 };

};

#endif
```



而平台的存储此处还是使用全局数组vector存储，来到main.cpp文件引入所需头文件，在全局区添加vector平台类型向量，随后来到on_enter方法中添加初始化，由于目前只提供四个平台所以先初始化平台数量为4，所以以此给与其赋值操作，最后在on_draw中添加遍历绘制所有平台的方法，运行程序可以看到三个平台正常渲染则说明成功完成渲染部分：

```
//main.cpp中全局区添加代码
#include <vector>
#include "platform.h"

std::vector<Platform> platform_list;

//gameScene.h中全局区添加代码
#include "platform.h"

extern std::vector<Platform> platform_list;

//gameScene.h文件GameScene类内on_enter初始化
platform_list.resize(4);
Platform& large_platform = platform_list[0];
large_platform.m_img = &img_platform_large;
large_platform.m_render_position.x = 122;
large_platform.m_render_position.y = 455;
large_platform.m_shape.left = (float)large_platform.m_render_position.x + 30;
large_platform.m_shape.right = (float)large_platform.m_render_position.x + img_platform_large.getwidth() - 30;
large_platform.m_shape.y = (float)large_platform.m_render_position.y + 60;

Platform& small_platform_1 = platform_list[1];
small_platform_1.m_img = &img_platform_small;
small_platform_1.m_render_position.x = 175;
small_platform_1.m_render_position.y = 360;
small_platform_1.m_shape.left = (float)small_platform_1.m_render_position.x + 40;
small_platform_1.m_shape.right = (float)small_platform_1.m_render_position.x + img_platform_small.getwidth() - 40;
small_platform_1.m_shape.y = (float)small_platform_1.m_render_position.y + img_platform_small.getheight() / 2;

Platform& small_platform_2 = platform_list[2];
small_platform_2.m_img = &img_platform_small;
small_platform_2.m_render_position.x = 855;
small_platform_2.m_render_position.y = 360;
small_platform_2.m_shape.left = (float)small_platform_2.m_render_position.x + 40;
small_platform_2.m_shape.right = (float)small_platform_2.m_render_position.x + img_platform_small.getwidth() - 40;
small_platform_2.m_shape.y = (float)small_platform_2.m_render_position.y + img_platform_small.getheight() / 2;

Platform& small_platform_3 = platform_list[3];
small_platform_3.m_img = &img_platform_small;
small_platform_3.m_render_position.x = 515;
small_platform_3.m_render_position.y = 255;
small_platform_3.m_shape.left = (float)small_platform_3.m_render_position.x + 40;
small_platform_3.m_shape.right = (float)small_platform_3.m_render_position.x + img_platform_small.getwidth() - 40;
small_platform_3.m_shape.y = (float)small_platform_3.m_render_position.y + img_platform_small.getheight() / 2;

//gameScene.h文件GameScene类内on_enter初始化
for (const Platform& p : platform_list)
{
	p.on_draw(camera);
}

```



不过此处只有图形渲染效果不包含数据，所以我们希望添加简单的调试模式，只有就可以显示所有我们希望看见的外边框或数据，帮助开发者对这些抽象碰撞数据进行可视化检查。

首先来到main.cpp中定义is_debug布尔类型，随后在platform.h文件通过extern获取，并在Platform类内的on_draw方法中通过检查debug状态是否开启来绘制碰撞线，由于使用了Camera进行摄像机重载版本，所有在utils.h中重载一个line方法用于绘制碰撞线，最后在platform.h文件写on_draw方法绘制，并且在gameScene.h文件写on_input的切换debug方法，这时运行程序并按下Q键即可看到正确渲染碰撞横线，这种可视化调试对开发者编程工作帮助极大，后面在做玩家碰撞时便可以得见：

```
//main.cpp文件全局区
bool is_debug = false;

//platform.h文件全局区
extern bool is_debug;

//utils.h文件编写
inline void line(const Camera& camera, int x1, int y1, int x2, int y2)
{
	const Vector2& pos_camera = camera.getPosition();
	line((int)(x1 - pos_camera.m_x), (int)(y1 - pos_camera.m_y), (int)(x2 - pos_camera.m_x), (int)(y2 - pos_camera.m_y));
}

//platform.h文件on_draw方法
if (is_debug)
{
	setlinecolor(RGB(255, 0, 0));
	line(camera, (int)this->m_shape.left, (int)this->m_shape.y, (int)this->m_shape.right, (int)this->m_shape.y);
}

//gameScene.h文件on_input方法
switch (msg.message)
{
case WM_KEYDOWN:
	break;
case WM_KEYUP:
	switch (msg.vkcode)
	{
	case 0x51://'Q'
		is_debug = !is_debug;
		break;
	default:
		break;
	}
	break;
default:
	break;
}
```



## 第八节完成代码展示

**main.cpp**

```
#include "atlas.h"
#include "camera.h"

#include "scene.h"
#include "sceneManager.h"
#include "menuScene.h"
#include "gameScene.h"
#include "selectorScene.h"

#include "utils.h"
#include "platform.h"

#pragma comment(lib, "Winmm.lib")

#include <graphics.h>
#include <vector>

const int FPS = 60;

bool is_debug = false;

Camera main_camera;

std::vector<Platform> platform_list;

IMAGE img_menu_background;					//主菜单背景图片

IMAGE img_VS;								//VS 艺术字图片
IMAGE img_1P;								//1P 文本图片
IMAGE img_2P;								//2P 文本图片
IMAGE img_1P_desc;							//1P 键位描述图片
IMAGE img_2P_desc;							//2P 键位描述图片
IMAGE img_select_background_left;			//选人朝左背景图片
IMAGE img_select_background_right;			//选人朝右背景图片
IMAGE img_selector_tip;						//选人界面提示信息
IMAGE img_selector_background;				//选人界面背景图
IMAGE img_1P_selector_btn_idle_left;		//1P 向左选择按钮默认状态图片
IMAGE img_1P_selector_btn_idle_right;		//1P 向右选择按钮默认状态图片
IMAGE img_1P_selector_btn_down_left;		//1P 向左选择按钮按下状态图片
IMAGE img_1P_selector_btn_down_right;		//1P 向右选择按钮按下状态图片
IMAGE img_2P_selector_btn_idle_left;		//2P 向左选择按钮默认状态图片
IMAGE img_2P_selector_btn_idle_right;		//2P 向右选择按钮默认状态图片
IMAGE img_2P_selector_btn_down_left;		//2P 向左选择按钮按下状态图片
IMAGE img_2P_selector_btn_down_right;		//2P 向右选择按钮按下状态图片
IMAGE img_gamer1_selector_background_left;	//选人界面类型1朝左背景图片
IMAGE img_gamer1_selector_background_right;	//选人界面类型1朝右背景图片
IMAGE img_gamer2_selector_background_left;	//选人界面类型2朝左背景图片
IMAGE img_gamer2_selector_background_right;	//选人界面类型2朝右背景图片

IMAGE img_sky;								//填空图片
IMAGE img_hills;							//山脉图片
IMAGE img_platform_large;					//大型平台图片
IMAGE img_platform_small;					//小型平台图片

IMAGE img_1P_cursor;						//1P 指示光标图片
IMAGE img_2P_cursor;						//2P 指示光标图片

Atlas atlas_gamer1_idle_left;				//类型1向左默认动画图集
Atlas atlas_gamer1_idle_right;				//类型1向右默认动画图集
Atlas atlas_gamer1_run_left;				//类型1向左奔跑动画图集
Atlas atlas_gamer1_run_right;				//类型1向右奔跑动画图集
Atlas atlas_gamer1_attack_ex_left;			//类型1向左特殊攻击动画图集
Atlas atlas_gamer1_attack_ex_right;			//类型1向右特殊攻击动画图集
Atlas atlas_gamer1_die_left;				//类型1向左死亡动画图集
Atlas atlas_gamer1_die_right;				//类型1向右死亡动画图集

Atlas atlas_gamer2_idle_left;				//类型2向左默认动画图集
Atlas atlas_gamer2_idle_right;				//类型2向右默认动画图集
Atlas atlas_gamer2_run_left;				//类型2向左奔跑动画图集
Atlas atlas_gamer2_run_right;				//类型2向右奔跑动画图集
Atlas atlas_gamer2_attack_ex_left;			//类型2向左特殊攻击动画图集
Atlas atlas_gamer2_attack_ex_right;			//类型2向右特殊攻击动画图集
Atlas atlas_gamer2_die_left;				//类型2向左死亡动画图集
Atlas atlas_gamer2_die_right;				//类型2向右死亡动画图集

IMAGE img_gamer1_bullet;					//类型1子弹图片
Atlas atlas_gamer1_bullet_break;			//类型1子弹破碎动画图集
Atlas atlas_gemer2_bullet;					//类型2子弹动画图集
Atlas atlas_gemer2_bullet_explode;			//类型2子弹爆炸动画图集
Atlas atlas_gamer2_bullet_ex;				//类型2特殊类型子弹动画图集
Atlas atlas_gamer2_bullet_ex_explode;		//类型2特殊类型子弹爆炸动画图集
Atlas atlas_gamer2_bullet_text;				//类型2特殊类型子弹爆炸文本动画图集

Atlas atlas_run_effect;						//奔跑特效动画图集
Atlas atlas_jump_effect;					//跳跃特效动画图集
Atlas atlas_land_effect;					//落地特效动画图集

IMAGE img_winner_bar;						//获胜玩家背景图片
IMAGE img_1P_winner;						//1P 获胜文本图片
IMAGE img_2P_winner;						//2P 获胜文本图片

IMAGE img_avatar_gamer1;					//类型1头像图片
IMAGE img_avatar_gamer2;					//类型2头像图片

Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;
Scene* selector_scene = nullptr;

SceneManager scene_manager;

void flipAtlas(Atlas& src, Atlas& dst)
{
	dst.clear();
	for (int i = 0; i < src.getSize(); i++)
	{
		IMAGE img_flpipped;
		flipImage(src.getImage(i), &img_flpipped);
		dst.addImage(img_flpipped);
	}
}

void loadGameResources()
{
	AddFontResourceEx(L"./resources/HYPixel11pxU-2.ttf", FR_PRIVATE, NULL);

	loadimage(&img_menu_background, L"./resources/menu_background.png");

	loadimage(&img_VS, L"./resources/VS.png");
	loadimage(&img_1P, L"./resources/1P.png");
	loadimage(&img_2P, L"./resources/2P.png");
	loadimage(&img_1P_desc, L"./resources/1P_desc.png");
	loadimage(&img_2P_desc, L"./resources/2P_desc.png");
	loadimage(&img_select_background_right, L"./resources/select_background.png");
	flipImage(&img_select_background_right, &img_select_background_left);
	loadimage(&img_selector_tip, L"./resources/selector_tip.png");
	loadimage(&img_selector_background, L"./resources/selector_background.png");
	loadimage(&img_1P_selector_btn_idle_right, L"./resources/1P_selector_btn_idle.png");
	flipImage(&img_1P_selector_btn_idle_right, &img_1P_selector_btn_idle_left);
	loadimage(&img_1P_selector_btn_down_right, L"./resources/1P_selector_btn_down.png");
	flipImage(&img_1P_selector_btn_down_right, &img_1P_selector_btn_down_left);
	loadimage(&img_2P_selector_btn_idle_right, L"./resources/2P_selector_btn_idle.png");
	flipImage(&img_2P_selector_btn_idle_right, &img_2P_selector_btn_idle_left);
	loadimage(&img_2P_selector_btn_down_right, L"./resources/2P_selector_btn_down.png");
	flipImage(&img_2P_selector_btn_down_right, &img_2P_selector_btn_down_left);
	loadimage(&img_gamer1_selector_background_right, L"./resources/gamer1_selector_background.png");
	flipImage(&img_gamer1_selector_background_right, &img_gamer1_selector_background_left);
	loadimage(&img_gamer2_selector_background_right, L"./resources/gamer2_selector_background.png");
	flipImage(&img_gamer2_selector_background_right, &img_gamer2_selector_background_left);

	loadimage(&img_sky, L"./resources/sky.png");
	loadimage(&img_hills, L"./resources/hills.png");
	loadimage(&img_platform_large, L"./resources/platform_large.png");
	loadimage(&img_platform_small, L"./resources/platform_small.png");

	loadimage(&img_1P_cursor, L"./resources/1P_cursor.png");
	loadimage(&img_2P_cursor, L"./resources/2P_cursor.png");

	atlas_gamer1_idle_right.loadFromFile(L"./resources/gamer1_idle_%d.png", 9);
	flipAtlas(atlas_gamer1_idle_right, atlas_gamer1_idle_left);
	atlas_gamer1_run_right.loadFromFile(L"./resources/gamer1_run_%d.png", 5);
	flipAtlas(atlas_gamer1_run_right, atlas_gamer1_run_left);
	atlas_gamer1_attack_ex_right.loadFromFile(L"./resources/gamer1_attack_ex_%d.png", 3);
	flipAtlas(atlas_gamer1_attack_ex_right, atlas_gamer1_attack_ex_left);
	atlas_gamer1_die_right.loadFromFile(L"./resources/gamer1_die_%d.png", 4);
	flipAtlas(atlas_gamer1_die_right, atlas_gamer1_die_left);

	atlas_gamer2_idle_right.loadFromFile(L"./resources/gamer2_idle_%d.png", 8);
	flipAtlas(atlas_gamer2_idle_right, atlas_gamer2_idle_left);
	atlas_gamer2_run_right.loadFromFile(L"./resources/gamer2_run_%d.png", 5);
	flipAtlas(atlas_gamer2_run_right, atlas_gamer2_run_left);
	atlas_gamer2_attack_ex_right.loadFromFile(L"./resources/gamer2_attack_ex_%d.png", 9);
	flipAtlas(atlas_gamer2_attack_ex_right, atlas_gamer2_attack_ex_left);
	atlas_gamer2_die_right.loadFromFile(L"./resources/gamer2_die_%d.png", 2);
	flipAtlas(atlas_gamer2_die_right, atlas_gamer2_die_left);

	loadimage(&img_gamer1_bullet, L"./resources/gamer1_bullet.png");
	atlas_gamer1_bullet_break.loadFromFile(L"./resources/gamer1_bullet_break_%d.png", 3);
	atlas_gemer2_bullet.loadFromFile(L"./resources/gamer2_bullet_%d.png", 5);
	atlas_gemer2_bullet_explode.loadFromFile(L"./resources/gamer2_bullet_explode_%d.png", 5);
	atlas_gamer2_bullet_ex.loadFromFile(L"./resources/gamer2_bullet_ex_%d.png", 5);
	atlas_gamer2_bullet_ex_explode.loadFromFile(L"./resources/gamer2_bullet_ex_explode_%d.png", 5);
	atlas_gamer2_bullet_text.loadFromFile(L"./resources/gamer2_bullet_text_%d.png", 6);

	atlas_run_effect.loadFromFile(L"./resources/run_effect_%d.png", 4);
	atlas_jump_effect.loadFromFile(L"./resources/jump_effect_%d.png", 5);
	atlas_land_effect.loadFromFile(L"./resources/land_effect_%d.png", 2);

	loadimage(&img_1P_winner, L"./resources/1P_winner.png");
	loadimage(&img_2P_winner, L"./resources/2P_winner.png");
	loadimage(&img_winner_bar, L"./resources/winner_bar.png");

	loadimage(&img_avatar_gamer1, L"./resources/avatar_gamer1.png");
	loadimage(&img_avatar_gamer2, L"./resources/avatar_gamer2.png");

	mciSendString(L"open ./resources/bgm_game.mp3 alias bgm_game", NULL, 0, NULL);
	mciSendString(L"open ./resources/bgm_menu.mp3 alias bgm_menu", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_1.mp3 alias gamer1_bullet_break_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_2.mp3 alias gamer1_bullet_break_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_3.mp3 alias gamer1_bullet_break_3", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_1.mp3 alias gamer1_bullet_shoot_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_2.mp3 alias gamer1_bullet_shoot_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_ex.mp3 alias gamer1_bullet_shoot_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode.mp3 alias gamer2_bullet_explode", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode_ex.mp3 alias gamer2_bullet_explode_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_text.mp3 alias gamer2_bullet_text", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_confirm.wav alias ui_confirm", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_switch.wav alias ui_switch", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_win.wav alias ui_win", NULL, 0, NULL);

	return;
}

int main()
{
	ExMessage msg;

	loadGameResources();
	
	initgraph(1200, 720);

	menu_scene = new MenuScene();
	game_scene = new GameScene();
	selector_scene = new SelectorScene();

	scene_manager.setCurrentState(menu_scene);

	settextstyle(28, 0, L"HYPixel11pxU-2.ttf");
	setbkmode(TRANSPARENT);

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene_manager.on_input(msg);
		}

		static DWORD last_tick_time = GetTickCount();
		DWORD current_tick_time = GetTickCount();
		DWORD delta_tick_time = current_tick_time - last_tick_time;
		scene_manager.on_updata(delta_tick_time);
		last_tick_time = current_tick_time;

		cleardevice();
		scene_manager.on_draw(main_camera);

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```

**utils.h**

```
#ifndef _UTILS_H_
#define _UTILS_H_

#pragma comment(lib, "MSIMG32.LIB")

#include <graphics.h>

inline void putImageAlpha(int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void putImageAlpha(const Camera& camera, int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), (int)(dst_x - camera.getPosition().m_x), (int)(dst_y - camera.getPosition().m_y), w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void putImageAlpha(int dst_x, int dst_y, int width, int height, IMAGE* img, int src_x, int src_y)
{
	int w = width > 0 ? width : img->getwidth(), h = height > 0 ? height : img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), src_x, src_y, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void line(const Camera& camera, int x1, int y1, int x2, int y2)
{
	const Vector2& pos_camera = camera.getPosition();
	line((int)(x1 - pos_camera.m_x), (int)(y1 - pos_camera.m_y), (int)(x2 - pos_camera.m_x), (int)(y2 - pos_camera.m_y));
}

inline void flipImage(IMAGE* src, IMAGE* dst)
{
	int w = src->getwidth(), h = src->getheight();
	Resize(dst, w, h);
	
	DWORD* src_buffer = GetImageBuffer(src);
	DWORD* dst_buffer = GetImageBuffer(dst);
	for (int i = 0; i < h; i++)
	{
		for (int j = 0; j < w; j++)
		{
			int src_idx = i * w + j, dst_idx = (i + 1) * w - j - 1;
			dst_buffer[dst_idx] = src_buffer[src_idx];
		}
	}
	return;
}

#endif
```

**platform.h**

```
#ifndef _PLATFORM_H_
#define _PLATFORM_H_

#include "utils.h"
#include "camera.h"

extern bool is_debug;

class Platform
{
public:
	Platform() = default;
	~Platform() = default;

	void on_draw(const Camera& camera) const
	{
		putImageAlpha(this->m_render_position.x, this->m_render_position.y, this->m_img);

		if (is_debug)
		{
			setlinecolor(RGB(255, 0, 0));
			line(camera, (int)this->m_shape.left, (int)this->m_shape.y, (int)this->m_shape.right, (int)this->m_shape.y);
		}
	}

public:
	struct CollisionShape
	{
		float y;
		float left, right;
	};

public:
	CollisionShape m_shape;

	IMAGE* m_img = nullptr;
	POINT m_render_position = { 0 };

};

#endif
```

**gameScene.h**

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "utils.h"
#include "platform.h"
#include "scene.h"
#include "sceneManager.h"

#include <iostream>

extern IMAGE img_sky;
extern IMAGE img_hills;
extern IMAGE img_platform_large;
extern IMAGE img_platform_small;

extern Camera main_camera;

extern std::vector<Platform> platform_list;

extern SceneManager scene_manager;

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter()
	{
		this->pos_img_sky.x = (getwidth() - img_sky.getwidth()) / 2;
		this->pos_img_sky.y = (getheight() - img_sky.getheight()) / 2;

		this->pos_img_hills.x = (getwidth() - img_hills.getwidth()) / 2;
		this->pos_img_hills.y = (getheight() - img_hills.getheight()) / 2;

		platform_list.resize(4);
		Platform& large_platform = platform_list[0];
		large_platform.m_img = &img_platform_large;
		large_platform.m_render_position.x = 122;
		large_platform.m_render_position.y = 455;
		large_platform.m_shape.left = (float)large_platform.m_render_position.x + 30;
		large_platform.m_shape.right = (float)large_platform.m_render_position.x + img_platform_large.getwidth() - 30;
		large_platform.m_shape.y = (float)large_platform.m_render_position.y + 60;

		Platform& small_platform_1 = platform_list[1];
		small_platform_1.m_img = &img_platform_small;
		small_platform_1.m_render_position.x = 175;
		small_platform_1.m_render_position.y = 360;
		small_platform_1.m_shape.left = (float)small_platform_1.m_render_position.x + 40;
		small_platform_1.m_shape.right = (float)small_platform_1.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_1.m_shape.y = (float)small_platform_1.m_render_position.y + img_platform_small.getheight() / 2;

		Platform& small_platform_2 = platform_list[2];
		small_platform_2.m_img = &img_platform_small;
		small_platform_2.m_render_position.x = 855;
		small_platform_2.m_render_position.y = 360;
		small_platform_2.m_shape.left = (float)small_platform_2.m_render_position.x + 40;
		small_platform_2.m_shape.right = (float)small_platform_2.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_2.m_shape.y = (float)small_platform_2.m_render_position.y + img_platform_small.getheight() / 2;

		Platform& small_platform_3 = platform_list[3];
		small_platform_3.m_img = &img_platform_small;
		small_platform_3.m_render_position.x = 515;
		small_platform_3.m_render_position.y = 255;
		small_platform_3.m_shape.left = (float)small_platform_3.m_render_position.x + 40;
		small_platform_3.m_shape.right = (float)small_platform_3.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_3.m_shape.y = (float)small_platform_3.m_render_position.y + img_platform_small.getheight() / 2;

	}

	virtual void on_update(int delta) {}

	virtual void on_draw(const Camera& camera) 
	{
		putImageAlpha(camera, this->pos_img_sky.x, this->pos_img_sky.y, &img_sky);
		putImageAlpha(camera, this->pos_img_hills.x, this->pos_img_hills.y, &img_hills);

		for (const Platform& p : platform_list)
		{
			p.on_draw(camera);
		}
	}

	virtual void on_input(const ExMessage& msg)
	{
		switch (msg.message)
		{
		case WM_KEYDOWN:
			break;
		case WM_KEYUP:
			switch (msg.vkcode)
			{
			case 0x51://'Q'
				is_debug = !is_debug;
				break;
			default:
				break;
			}
			break;
		default:
			break;
		}
	}

	virtual void on_exit() {}

private:
	POINT pos_img_sky = { 0 };
	POINT pos_img_hills = { 0 };

};

#endif
```



## 第九节

### 简单物理实现——玩家

当前已有平台对象作为碰撞的一部分，那么只有完成与之碰撞的另一半也就是玩家实体，物理系统在功能上才能称之为完善的，所以首先要考虑的便是如何对玩家类相关的逻辑进行抽象，首先从功能入手分析玩家类设计。

所有的玩家类都能执行运动，跳跃，发射子弹的逻辑无非是触发逻辑的按键有所不同以及执行的效果不同，所有有之前场景设计阶段经验就可以类比Scene基类定义Player基类，作为不同角色类型生成的模板，并将所有玩家具备的数据与逻辑封装在里面，而实际所选角色则继承子Player类实现自己的逻辑。

首先啊在头文件中创建筛选器Player，并在筛选器中创建头文件player.h，playerGamer1.h，playerGamer2.h，首先来到player.h中，创建Player类并引入camera.h定义on_update与on_draw两个成员方法，随后引入graphics.h并定义on_input方法：

```
#ifndef _PLAYER_H_
#define _PLAYER_H_

#include "camera.h"

#include <graphics.h>

class Player
{
public:
	Player() = default;
	~Player() = default;

	virtual void on_update(int delta) {}

	virtual void on_draw(const Camera& camera) {}

	virtual void on_input(const ExMessage& msg) {}

};


#endif // !_PLAYER_H_
```



随后先将子类继承完成后再仔细思考补充基类代码，来到playerGamer1.h文件，声明并继承基类重写on_update方法输出提示词，同样的我们对playerGamer2.h文件中做同样的处理：

```
//playerGamer1.h文件
#ifndef _PLAYERGAMER1_H_
#define _PLAYERGAMER1_H_

#include "player.h"

#include <iostream>

class PlayerGamer1 : public Player
{
public:
	PlayerGamer1() = default;
	~PlayerGamer1() = default;

	virtual void on_update(int delta)
	{
		std::cout << "Gamer1 on update..." << std::endl;
	}

};

#endif // !_PLAYERGAMER1_H_

//playerGamer2.h文件下
#ifndef _PLAYERGAMER2_H_
#define _PLAYERGAMER2_H_

#include "player.h"

#include <iostream>

class PlayerGamer2 : public Player
{
public:
	PlayerGamer2() = default;
	~PlayerGamer2() = default;

	virtual void on_update(int delta)
	{
		std::cout << "Gamer2 on update..." << std::endl;
	}

};

#endif // !_PLAYERGAMER2_H_
```



完成类定义，实例化的实现很容易发现因当是在选角场景中由玩家选择完成实现的，而局内也要使用角色，所以像这类跨越多场景的生命周期较长的对象，我们就同样使用全局创建变量的方法进行。

来到main.cpp中在全局区引用player相关头文件，并定义两玩家角色指针，随后在selectorScene中在on_exit中编写退出逻辑，在全局区引入头文件以及变量，根据最后玩家不同类型实例化角色子类对象，最后来到gameScene.h中引入player.h头文件与player_1与player_2资源后就可以在on_update方法中调用其更新方法了，运行程序可以看到控制台输出即正确：

```
//main.cpp全局区声明
#include "player.h"
#include "playerGamer1.h"
#include "playerGamer2.h"

Player* player_1 = nullptr;
Player* player_2 = nullptr;

//selectorScene.h全局区声明
#include "player.h"
#include "playerGamer1.h"
#include "playerGamer2.h"

extern Player* player_1;
extern Player* player_2;

//selectorScene.h类内on_exit方法
switch (this->m_player_type_1)
{
case PlayerType::Gamer1:
	player_1 = new PlayerGamer1();
	break;
case PlayerType::Gamer2:
	player_1 = new PlayerGamer2();
	break;
}

switch (this->m_player_type_2)
{
case PlayerType::Gamer1:
	player_2 = new PlayerGamer1();
	break;
case PlayerType::Gamer2:
	player_2 = new PlayerGamer2();
	break;
}

//gameScene.h全局区声明
#include "player.h"

extern Player* player_1;
extern Player* player_2;

//gameScene.h类内on_update方法
player_1->on_update(delta);
player_2->on_update(delta);
```



接下来要实现玩家的移动，所以我们还需要记录玩家的世界坐标，所以在player.h文件中引入vector2.h并在成员变量中创建Vector2变量记录玩家世界坐标位置，为了更好观察画面效果我们可以先添加玩家角色动画相关的定义，引入animation.h头文件并创建四个动画变量，这一部分实现应放在子类中按不同状况进行实例我们稍后完成。

```
//player.h文件引入头文件
#include "vector2.h"
#include "animation.h"

//player.h文件Player类内创建私有成员变量
private:
	Vector2 m_position;

	Animation m_animation_idle_left;
	Animation m_animation_idle_right;
	Animation m_animation_run_left;
	Animation m_animation_run_right;
	

```

还有什么共同内容可以在基类中完成呢？显然读取玩家按键操作将按键消息映射到对应逻辑这一部分代码，不过这也引出新的问题，玩家类型可以通过类继承进行区别，那么与玩家键位控制相关的玩家序号该如何编写呢，实我们决定将玩家序号作为玩家对象一个成员只需要在按键操作时根据序号执行不同逻辑即可。

所以接下来创建playerId.h头文件，随后定义枚举类枚举id类型以P1与P2来确定玩家Id类型：

```
#ifndef _PLAYERID_H_
#define _PLAYERID_H_

enum class PlayerId
{
	P1,
	P2
};

#endif
```

接下来回到player.h文件中引入playerId.h头文件，并在Player类中声明私有成员变量PlayerId类并提供setId方法，接下来来到selectorScene.h中引入playerId.h头文件并在on_exit方法中分别为其id赋值，随后回到player.h中在类内减价按键是否按下的相关布尔类型变量，然后便可以在on_input中编写相关按键按下的处理方法，需要注意嵌套switch的顺序，由于整个程序在同一台主机上运行所以整个按键消息是共享的所以必须使用id进行区分响应玩家的按键消息，最后通过on_update中做差的方式判断当前移动方向并在成员变量中添加角色朝向记录其当前的朝向以及当前动画指针，这样就可以在on_update中编辑当玩家是否移动时玩家朝向的变化了，并在最后更新动画，这样就就可以在on_draw中对当前动画进行渲染了，如此我们就可以在更上层也就是gameScene.h中的on_draw方法调用player_1与player_2的渲染方法以及on_input方法了：

```
//player.h文件添加头文件
#include "playerId.h"

//player.h文件Player类内提供设置函数
void setId(PlayerId id) { this->m_id = id; }

//player.h文件Player类内添加变量
PlayerId m_id;

//selectorScene.h文件添加头文件
#include "playerId.h"

//selectorScene.h成员函数on_exit中添加
player_1->setId(PlayerId::P1);
player_2->setId(PlayerId::P2);

//player.h类内成员变量
bool is_left_keydown = false;
bool is_right_keydown = false;

//player.h类内成员on_input函数
switch (msg.message)
{
case WM_KEYDOWN:
	switch (this->m_id)
	{
	case PlayerId::P1:
		switch (msg.vkcode)
		{
		case 0x41://'A'
			this->is_left_keydown = true;
			break;
		case 0x44://'D'
			this->is_right_keydown = true;
			break;
		}
		break;
	case PlayerId::P2:
		switch (msg.vkcode)
		{
		case VK_LEFT://'←'
			this->is_left_keydown = true;
			break;
		case VK_RIGHT://'→'
			this->is_right_keydown = true;
			break;
		}
		break;
	}
	break;
case WM_KEYUP:
	switch (this->m_id)
	{
	case PlayerId::P1:
		switch (msg.vkcode)
		{
		case 0x41://'A'
			this->is_left_keydown = false;
			break;
		case 0x44://'D'
			this->is_right_keydown = false;
			break;
		}
		break;
	case PlayerId::P2:
		switch (msg.vkcode)
		{
		case VK_LEFT://'←'
			this->is_left_keydown = false;
			break;
		case VK_RIGHT://'→'
			this->is_right_keydown = false;
			break;
		}
		break;
	}
	break;
}

//player.h中成员变量声明
bool is_facing_right = true;

Animation* m_current_animaiton = nullptr;

//player.h中on_update方法
int direction = this->is_right_keydown - this->is_left_keydown;

if (direction != 0)
{
	this->is_facing_right = direction > 0;
	this->m_current_animaiton = is_facing_right ? &this->m_animation_run_right : &this->m_animation_run_left;
}
else
{
	this->m_current_animaiton = is_facing_right ? &this->m_animation_idle_right : &this->m_animation_idle_left;
}

this->m_current_animaiton->on_update(delta);

//player.h中on_draw渲染
this->m_current_animaiton->on_draw(camera, this->m_position.m_x, this->m_position.m_y);

//gameScene.h中on_draw渲染
player_1->on_draw(camera);
player_2->on_draw(camera);

//gameScene.h中on_input渲染
player_1->on_input(msg);
player_2->on_input(msg);
```



接下来开始着手填充子类的实现，首先来到playerGamer1.h中使用extern将所需资源引入，随后在无参构造中初始化资源，不过会发现this指针找不到Animation的几个变量，只需要将Player中成员变量类型转为protected即可，随后在playerGamer2.h中做相同操作：

```
//playerGamer1.h全局资源引入
extern Atlas atlas_gamer1_idle_left;
extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer1_run_left;
extern Atlas atlas_gamer1_run_right;

//player.h中成员变量类型由private改为protected
protected:

//playerGamer1.h无参构造方法
this->m_animation_idle_left.setAtlas(&atlas_gamer1_idle_left);
this->m_animation_idle_right.setAtlas(&atlas_gamer1_idle_right);
this->m_animation_run_left.setAtlas(&atlas_gamer1_run_left);
this->m_animation_run_right.setAtlas(&atlas_gamer1_run_right);

this->m_animation_idle_left.setInterval(75);
this->m_animation_idle_right.setInterval(75);
this->m_animation_run_left.setInterval(75);
this->m_animation_run_right.setInterval(75);

//playerGamer2.h全局资源引入
extern Atlas atlas_gamer2_idle_left;
extern Atlas atlas_gamer2_idle_right;
extern Atlas atlas_gamer2_run_left;
extern Atlas atlas_gamer2_run_right;

//playerGamer2.h无参构造方法
this->m_animation_idle_left.setAtlas(&atlas_gamer2_idle_left);
this->m_animation_idle_right.setAtlas(&atlas_gamer2_idle_right);
this->m_animation_run_left.setAtlas(&atlas_gamer2_run_left);
this->m_animation_run_right.setAtlas(&atlas_gamer2_run_right);

this->m_animation_idle_left.setInterval(75);
this->m_animation_idle_right.setInterval(75);
this->m_animation_run_left.setInterval(75);
this->m_animation_run_right.setInterval(75);
```



运行程序，我们会发现程序出现了错误在on_draw处，这里就体现了层层调试的必要性了，在Animation类完成时测试结果无误，而在此时出现问题说明只有可能是Player类中出现了问题，也就是m_current_animation指针本身，追根溯源我们可以发现，从该开始我们并未对其进行赋值，其初始状态为nullptr所以绘制时导致空指针出现了错误，那么我们只需要在Player类内的无参构造方法中添加初始化代码即可。

运行程序P1与P2都挤在左上角，原位并未对其坐标进行初始化，所以在Player类内提供setPosition方法设置坐标，随后在gameScene.h的on_enter中初始化其坐标，但由于子类重写了父类的on_update方法而动画更新写在了基类on_update中，所以只需要在子类调用父类的on_update方法即可，运行程序角色正确进行渲染且按下左右按键可以正确转向即完成本课程内容：

```
//player.h无参构造函数初始化
this->m_current_animaiton = &this->m_animation_idle_right;

//player.h提供设置坐标方法
void setPosition(int x, int y) { this->m_position.m_x = x, this->m_position.m_y = y; }

//gameScene.h文件on_enter中初始化坐标
player_1->setPosition(200, 50);
player_2->setPosition(975, 50);

//playerGame1.h文件中on_update添加
Player::on_update(delta);

//playerGame2.h文件中on_update添加
Player::on_update(delta);

```



## 第九节完成代码展示

**main.cpp**

```
#include "atlas.h"
#include "camera.h"

#include "scene.h"
#include "sceneManager.h"
#include "menuScene.h"
#include "gameScene.h"
#include "selectorScene.h"

#include "utils.h"
#include "platform.h"

#include "player.h"
#include "playerGamer1.h"
#include "playerGamer2.h"

#pragma comment(lib, "Winmm.lib")

#include <graphics.h>
#include <vector>

const int FPS = 60;

bool is_debug = false;

Camera main_camera;

std::vector<Platform> platform_list;

Player* player_1 = nullptr;
Player* player_2 = nullptr;

IMAGE img_menu_background;					//主菜单背景图片

IMAGE img_VS;								//VS 艺术字图片
IMAGE img_1P;								//1P 文本图片
IMAGE img_2P;								//2P 文本图片
IMAGE img_1P_desc;							//1P 键位描述图片
IMAGE img_2P_desc;							//2P 键位描述图片
IMAGE img_select_background_left;			//选人朝左背景图片
IMAGE img_select_background_right;			//选人朝右背景图片
IMAGE img_selector_tip;						//选人界面提示信息
IMAGE img_selector_background;				//选人界面背景图
IMAGE img_1P_selector_btn_idle_left;		//1P 向左选择按钮默认状态图片
IMAGE img_1P_selector_btn_idle_right;		//1P 向右选择按钮默认状态图片
IMAGE img_1P_selector_btn_down_left;		//1P 向左选择按钮按下状态图片
IMAGE img_1P_selector_btn_down_right;		//1P 向右选择按钮按下状态图片
IMAGE img_2P_selector_btn_idle_left;		//2P 向左选择按钮默认状态图片
IMAGE img_2P_selector_btn_idle_right;		//2P 向右选择按钮默认状态图片
IMAGE img_2P_selector_btn_down_left;		//2P 向左选择按钮按下状态图片
IMAGE img_2P_selector_btn_down_right;		//2P 向右选择按钮按下状态图片
IMAGE img_gamer1_selector_background_left;	//选人界面类型1朝左背景图片
IMAGE img_gamer1_selector_background_right;	//选人界面类型1朝右背景图片
IMAGE img_gamer2_selector_background_left;	//选人界面类型2朝左背景图片
IMAGE img_gamer2_selector_background_right;	//选人界面类型2朝右背景图片

IMAGE img_sky;								//填空图片
IMAGE img_hills;							//山脉图片
IMAGE img_platform_large;					//大型平台图片
IMAGE img_platform_small;					//小型平台图片

IMAGE img_1P_cursor;						//1P 指示光标图片
IMAGE img_2P_cursor;						//2P 指示光标图片

Atlas atlas_gamer1_idle_left;				//类型1向左默认动画图集
Atlas atlas_gamer1_idle_right;				//类型1向右默认动画图集
Atlas atlas_gamer1_run_left;				//类型1向左奔跑动画图集
Atlas atlas_gamer1_run_right;				//类型1向右奔跑动画图集
Atlas atlas_gamer1_attack_ex_left;			//类型1向左特殊攻击动画图集
Atlas atlas_gamer1_attack_ex_right;			//类型1向右特殊攻击动画图集
Atlas atlas_gamer1_die_left;				//类型1向左死亡动画图集
Atlas atlas_gamer1_die_right;				//类型1向右死亡动画图集

Atlas atlas_gamer2_idle_left;				//类型2向左默认动画图集
Atlas atlas_gamer2_idle_right;				//类型2向右默认动画图集
Atlas atlas_gamer2_run_left;				//类型2向左奔跑动画图集
Atlas atlas_gamer2_run_right;				//类型2向右奔跑动画图集
Atlas atlas_gamer2_attack_ex_left;			//类型2向左特殊攻击动画图集
Atlas atlas_gamer2_attack_ex_right;			//类型2向右特殊攻击动画图集
Atlas atlas_gamer2_die_left;				//类型2向左死亡动画图集
Atlas atlas_gamer2_die_right;				//类型2向右死亡动画图集

IMAGE img_gamer1_bullet;					//类型1子弹图片
Atlas atlas_gamer1_bullet_break;			//类型1子弹破碎动画图集
Atlas atlas_gemer2_bullet;					//类型2子弹动画图集
Atlas atlas_gemer2_bullet_explode;			//类型2子弹爆炸动画图集
Atlas atlas_gamer2_bullet_ex;				//类型2特殊类型子弹动画图集
Atlas atlas_gamer2_bullet_ex_explode;		//类型2特殊类型子弹爆炸动画图集
Atlas atlas_gamer2_bullet_text;				//类型2特殊类型子弹爆炸文本动画图集

Atlas atlas_run_effect;						//奔跑特效动画图集
Atlas atlas_jump_effect;					//跳跃特效动画图集
Atlas atlas_land_effect;					//落地特效动画图集

IMAGE img_winner_bar;						//获胜玩家背景图片
IMAGE img_1P_winner;						//1P 获胜文本图片
IMAGE img_2P_winner;						//2P 获胜文本图片

IMAGE img_avatar_gamer1;					//类型1头像图片
IMAGE img_avatar_gamer2;					//类型2头像图片

Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;
Scene* selector_scene = nullptr;

SceneManager scene_manager;

void flipAtlas(Atlas& src, Atlas& dst)
{
	dst.clear();
	for (int i = 0; i < src.getSize(); i++)
	{
		IMAGE img_flpipped;
		flipImage(src.getImage(i), &img_flpipped);
		dst.addImage(img_flpipped);
	}
}

void loadGameResources()
{
	AddFontResourceEx(L"./resources/HYPixel11pxU-2.ttf", FR_PRIVATE, NULL);

	loadimage(&img_menu_background, L"./resources/menu_background.png");

	loadimage(&img_VS, L"./resources/VS.png");
	loadimage(&img_1P, L"./resources/1P.png");
	loadimage(&img_2P, L"./resources/2P.png");
	loadimage(&img_1P_desc, L"./resources/1P_desc.png");
	loadimage(&img_2P_desc, L"./resources/2P_desc.png");
	loadimage(&img_select_background_right, L"./resources/select_background.png");
	flipImage(&img_select_background_right, &img_select_background_left);
	loadimage(&img_selector_tip, L"./resources/selector_tip.png");
	loadimage(&img_selector_background, L"./resources/selector_background.png");
	loadimage(&img_1P_selector_btn_idle_right, L"./resources/1P_selector_btn_idle.png");
	flipImage(&img_1P_selector_btn_idle_right, &img_1P_selector_btn_idle_left);
	loadimage(&img_1P_selector_btn_down_right, L"./resources/1P_selector_btn_down.png");
	flipImage(&img_1P_selector_btn_down_right, &img_1P_selector_btn_down_left);
	loadimage(&img_2P_selector_btn_idle_right, L"./resources/2P_selector_btn_idle.png");
	flipImage(&img_2P_selector_btn_idle_right, &img_2P_selector_btn_idle_left);
	loadimage(&img_2P_selector_btn_down_right, L"./resources/2P_selector_btn_down.png");
	flipImage(&img_2P_selector_btn_down_right, &img_2P_selector_btn_down_left);
	loadimage(&img_gamer1_selector_background_right, L"./resources/gamer1_selector_background.png");
	flipImage(&img_gamer1_selector_background_right, &img_gamer1_selector_background_left);
	loadimage(&img_gamer2_selector_background_right, L"./resources/gamer2_selector_background.png");
	flipImage(&img_gamer2_selector_background_right, &img_gamer2_selector_background_left);

	loadimage(&img_sky, L"./resources/sky.png");
	loadimage(&img_hills, L"./resources/hills.png");
	loadimage(&img_platform_large, L"./resources/platform_large.png");
	loadimage(&img_platform_small, L"./resources/platform_small.png");

	loadimage(&img_1P_cursor, L"./resources/1P_cursor.png");
	loadimage(&img_2P_cursor, L"./resources/2P_cursor.png");

	atlas_gamer1_idle_right.loadFromFile(L"./resources/gamer1_idle_%d.png", 9);
	flipAtlas(atlas_gamer1_idle_right, atlas_gamer1_idle_left);
	atlas_gamer1_run_right.loadFromFile(L"./resources/gamer1_run_%d.png", 5);
	flipAtlas(atlas_gamer1_run_right, atlas_gamer1_run_left);
	atlas_gamer1_attack_ex_right.loadFromFile(L"./resources/gamer1_attack_ex_%d.png", 3);
	flipAtlas(atlas_gamer1_attack_ex_right, atlas_gamer1_attack_ex_left);
	atlas_gamer1_die_right.loadFromFile(L"./resources/gamer1_die_%d.png", 4);
	flipAtlas(atlas_gamer1_die_right, atlas_gamer1_die_left);

	atlas_gamer2_idle_right.loadFromFile(L"./resources/gamer2_idle_%d.png", 8);
	flipAtlas(atlas_gamer2_idle_right, atlas_gamer2_idle_left);
	atlas_gamer2_run_right.loadFromFile(L"./resources/gamer2_run_%d.png", 5);
	flipAtlas(atlas_gamer2_run_right, atlas_gamer2_run_left);
	atlas_gamer2_attack_ex_right.loadFromFile(L"./resources/gamer2_attack_ex_%d.png", 9);
	flipAtlas(atlas_gamer2_attack_ex_right, atlas_gamer2_attack_ex_left);
	atlas_gamer2_die_right.loadFromFile(L"./resources/gamer2_die_%d.png", 2);
	flipAtlas(atlas_gamer2_die_right, atlas_gamer2_die_left);

	loadimage(&img_gamer1_bullet, L"./resources/gamer1_bullet.png");
	atlas_gamer1_bullet_break.loadFromFile(L"./resources/gamer1_bullet_break_%d.png", 3);
	atlas_gemer2_bullet.loadFromFile(L"./resources/gamer2_bullet_%d.png", 5);
	atlas_gemer2_bullet_explode.loadFromFile(L"./resources/gamer2_bullet_explode_%d.png", 5);
	atlas_gamer2_bullet_ex.loadFromFile(L"./resources/gamer2_bullet_ex_%d.png", 5);
	atlas_gamer2_bullet_ex_explode.loadFromFile(L"./resources/gamer2_bullet_ex_explode_%d.png", 5);
	atlas_gamer2_bullet_text.loadFromFile(L"./resources/gamer2_bullet_text_%d.png", 6);

	atlas_run_effect.loadFromFile(L"./resources/run_effect_%d.png", 4);
	atlas_jump_effect.loadFromFile(L"./resources/jump_effect_%d.png", 5);
	atlas_land_effect.loadFromFile(L"./resources/land_effect_%d.png", 2);

	loadimage(&img_1P_winner, L"./resources/1P_winner.png");
	loadimage(&img_2P_winner, L"./resources/2P_winner.png");
	loadimage(&img_winner_bar, L"./resources/winner_bar.png");

	loadimage(&img_avatar_gamer1, L"./resources/avatar_gamer1.png");
	loadimage(&img_avatar_gamer2, L"./resources/avatar_gamer2.png");

	mciSendString(L"open ./resources/bgm_game.mp3 alias bgm_game", NULL, 0, NULL);
	mciSendString(L"open ./resources/bgm_menu.mp3 alias bgm_menu", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_1.mp3 alias gamer1_bullet_break_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_2.mp3 alias gamer1_bullet_break_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_3.mp3 alias gamer1_bullet_break_3", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_1.mp3 alias gamer1_bullet_shoot_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_2.mp3 alias gamer1_bullet_shoot_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_ex.mp3 alias gamer1_bullet_shoot_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode.mp3 alias gamer2_bullet_explode", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode_ex.mp3 alias gamer2_bullet_explode_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_text.mp3 alias gamer2_bullet_text", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_confirm.wav alias ui_confirm", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_switch.wav alias ui_switch", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_win.wav alias ui_win", NULL, 0, NULL);

	return;
}

int main()
{
	ExMessage msg;

	loadGameResources();
	
	initgraph(1200, 720);

	menu_scene = new MenuScene();
	game_scene = new GameScene();
	selector_scene = new SelectorScene();

	scene_manager.setCurrentState(menu_scene);

	settextstyle(28, 0, L"HYPixel11pxU-2.ttf");
	setbkmode(TRANSPARENT);

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene_manager.on_input(msg);
		}

		static DWORD last_tick_time = GetTickCount();
		DWORD current_tick_time = GetTickCount();
		DWORD delta_tick_time = current_tick_time - last_tick_time;
		scene_manager.on_updata(delta_tick_time);
		last_tick_time = current_tick_time;

		cleardevice();
		scene_manager.on_draw(main_camera);

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```

**player.h**

```
#ifndef _PLAYER_H_
#define _PLAYER_H_

#include "camera.h"
#include "vector2.h"
#include "animation.h"
#include "playerId.h"

#include <graphics.h>

class Player
{
public:
	Player()
	{
		this->m_current_animaiton = &this->m_animation_idle_right;
	}

	~Player() = default;

	virtual void on_update(int delta)
	{
		int direction = this->is_right_keydown - this->is_left_keydown;

		if (direction != 0)
		{
			this->is_facing_right = direction > 0;
			this->m_current_animaiton = is_facing_right ? &this->m_animation_run_right : &this->m_animation_run_left;
		}
		else
		{
			this->m_current_animaiton = is_facing_right ? &this->m_animation_idle_right : &this->m_animation_idle_left;
		}

		this->m_current_animaiton->on_update(delta);
	}

	virtual void on_draw(const Camera& camera)
	{
		this->m_current_animaiton->on_draw(camera, this->m_position.m_x, this->m_position.m_y);
	}

	virtual void on_input(const ExMessage& msg)
	{
		switch (msg.message)
		{
		case WM_KEYDOWN:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = true;
					break;
				case 0x44://'D'
					this->is_right_keydown = true;
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = true;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = true;
					break;
				}
				break;
			}
			break;
		case WM_KEYUP:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = false;
					break;
				case 0x44://'D'
					this->is_right_keydown = false;
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = false;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = false;
					break;
				}
				break;
			}
			break;
		}
	}

	void setId(PlayerId id) { this->m_id = id; }

	void setPosition(int x, int y) { this->m_position.m_x = x, this->m_position.m_y = y; }

protected:
	Vector2 m_position;

	Animation m_animation_idle_left;
	Animation m_animation_idle_right;
	Animation m_animation_run_left;
	Animation m_animation_run_right;

	Animation* m_current_animaiton = nullptr;

	PlayerId m_id;

	bool is_left_keydown = false;
	bool is_right_keydown = false;

	bool is_facing_right = true;

};


#endif // !_PLAYER_H_

```

**playerGamer1.h**

```
#ifndef _PLAYERGAMER1_H_
#define _PLAYERGAMER1_H_

#include "player.h"

#include <iostream>

extern Atlas atlas_gamer1_idle_left;
extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer1_run_left;
extern Atlas atlas_gamer1_run_right;

class PlayerGamer1 : public Player
{
public:
	PlayerGamer1()
	{
		this->m_animation_idle_left.setAtlas(&atlas_gamer1_idle_left);
		this->m_animation_idle_right.setAtlas(&atlas_gamer1_idle_right);
		this->m_animation_run_left.setAtlas(&atlas_gamer1_run_left);
		this->m_animation_run_right.setAtlas(&atlas_gamer1_run_right);

		this->m_animation_idle_left.setInterval(75);
		this->m_animation_idle_right.setInterval(75);
		this->m_animation_run_left.setInterval(75);
		this->m_animation_run_right.setInterval(75);
	}

	~PlayerGamer1() = default;

	virtual void on_update(int delta)
	{
		Player::on_update(delta);
		std::cout << "Gamer1 on update..." << std::endl;
	}

};

#endif // !_PLAYERGAMER1_H_

```

**playerGamer2.h**

```
#ifndef _PLAYERGAMER2_H_
#define _PLAYERGAMER2_H_

#include "player.h"

#include <iostream>

extern Atlas atlas_gamer2_idle_left;
extern Atlas atlas_gamer2_idle_right;
extern Atlas atlas_gamer2_run_left;
extern Atlas atlas_gamer2_run_right;

class PlayerGamer2 : public Player
{
public:
	PlayerGamer2()
	{
		this->m_animation_idle_left.setAtlas(&atlas_gamer2_idle_left);
		this->m_animation_idle_right.setAtlas(&atlas_gamer2_idle_right);
		this->m_animation_run_left.setAtlas(&atlas_gamer2_run_left);
		this->m_animation_run_right.setAtlas(&atlas_gamer2_run_right);

		this->m_animation_idle_left.setInterval(75);
		this->m_animation_idle_right.setInterval(75);
		this->m_animation_run_left.setInterval(75);
		this->m_animation_run_right.setInterval(75);
	}

	~PlayerGamer2() = default;

	virtual void on_update(int delta)
	{
		Player::on_update(delta);
		std::cout << "Gamer2 on update..." << std::endl;
	}

};

#endif // !_PLAYERGAMER2_H_
```

**playerId.h**

```
#ifndef _PLAYERID_H_
#define _PLAYERID_H_

enum class PlayerId
{
	P1,
	P2
};

#endif

```

**gameScene.h**

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "utils.h"
#include "platform.h"
#include "scene.h"
#include "sceneManager.h"
#include "player.h"

#include <iostream>

extern Player* player_1;
extern Player* player_2;

extern IMAGE img_sky;
extern IMAGE img_hills;
extern IMAGE img_platform_large;
extern IMAGE img_platform_small;

extern Camera main_camera;

extern std::vector<Platform> platform_list;

extern SceneManager scene_manager;

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter()
	{
		player_1->setPosition(200, 50);
		player_2->setPosition(975, 50);

		this->pos_img_sky.x = (getwidth() - img_sky.getwidth()) / 2;
		this->pos_img_sky.y = (getheight() - img_sky.getheight()) / 2;

		this->pos_img_hills.x = (getwidth() - img_hills.getwidth()) / 2;
		this->pos_img_hills.y = (getheight() - img_hills.getheight()) / 2;

		platform_list.resize(4);
		Platform& large_platform = platform_list[0];
		large_platform.m_img = &img_platform_large;
		large_platform.m_render_position.x = 122;
		large_platform.m_render_position.y = 455;
		large_platform.m_shape.left = (float)large_platform.m_render_position.x + 30;
		large_platform.m_shape.right = (float)large_platform.m_render_position.x + img_platform_large.getwidth() - 30;
		large_platform.m_shape.y = (float)large_platform.m_render_position.y + 60;

		Platform& small_platform_1 = platform_list[1];
		small_platform_1.m_img = &img_platform_small;
		small_platform_1.m_render_position.x = 175;
		small_platform_1.m_render_position.y = 360;
		small_platform_1.m_shape.left = (float)small_platform_1.m_render_position.x + 40;
		small_platform_1.m_shape.right = (float)small_platform_1.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_1.m_shape.y = (float)small_platform_1.m_render_position.y + img_platform_small.getheight() / 2;

		Platform& small_platform_2 = platform_list[2];
		small_platform_2.m_img = &img_platform_small;
		small_platform_2.m_render_position.x = 855;
		small_platform_2.m_render_position.y = 360;
		small_platform_2.m_shape.left = (float)small_platform_2.m_render_position.x + 40;
		small_platform_2.m_shape.right = (float)small_platform_2.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_2.m_shape.y = (float)small_platform_2.m_render_position.y + img_platform_small.getheight() / 2;

		Platform& small_platform_3 = platform_list[3];
		small_platform_3.m_img = &img_platform_small;
		small_platform_3.m_render_position.x = 515;
		small_platform_3.m_render_position.y = 255;
		small_platform_3.m_shape.left = (float)small_platform_3.m_render_position.x + 40;
		small_platform_3.m_shape.right = (float)small_platform_3.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_3.m_shape.y = (float)small_platform_3.m_render_position.y + img_platform_small.getheight() / 2;

	}

	virtual void on_update(int delta)
	{
		player_1->on_update(delta);
		player_2->on_update(delta);
	}

	virtual void on_draw(const Camera& camera) 
	{
		putImageAlpha(camera, this->pos_img_sky.x, this->pos_img_sky.y, &img_sky);
		putImageAlpha(camera, this->pos_img_hills.x, this->pos_img_hills.y, &img_hills);

		for (const Platform& p : platform_list)
		{
			p.on_draw(camera);
		}

		player_1->on_draw(camera);
		player_2->on_draw(camera);
	}

	virtual void on_input(const ExMessage& msg)
	{
		player_1->on_input(msg);
		player_2->on_input(msg);

		switch (msg.message)
		{
		case WM_KEYDOWN:
			break;
		case WM_KEYUP:
			switch (msg.vkcode)
			{
			case 0x51://'Q'
				is_debug = !is_debug;
				break;
			default:
				break;
			}
			break;
		default:
			break;
		}
	}

	virtual void on_exit() {}

private:
	POINT pos_img_sky = { 0 };
	POINT pos_img_hills = { 0 };

};

#endif
```

**selectorScene.h**

```
#ifndef _SELECTOR_SCENE_H_
#define _SELECTOR_SCENE_H_

#include "utils.h"

#include "scene.h"
#include "sceneManager.h"

#include "animation.h"

#include "player.h"
#include "playerGamer1.h"
#include "playerGamer2.h"

extern Player* player_1;
extern Player* player_2;

extern IMAGE img_VS;
extern IMAGE img_1P;
extern IMAGE img_2P;
extern IMAGE img_1P_desc;
extern IMAGE img_2P_desc;
extern IMAGE img_select_background_left;
extern IMAGE img_select_background_right;
extern IMAGE img_selector_tip;
extern IMAGE img_selector_background;
extern IMAGE img_1P_selector_btn_idle_left;
extern IMAGE img_1P_selector_btn_idle_right;
extern IMAGE img_1P_selector_btn_down_left;
extern IMAGE img_1P_selector_btn_down_right;
extern IMAGE img_2P_selector_btn_idle_left;
extern IMAGE img_2P_selector_btn_idle_right;
extern IMAGE img_2P_selector_btn_down_left;
extern IMAGE img_2P_selector_btn_down_right;
extern IMAGE img_gamer1_selector_background_left;
extern IMAGE img_gamer1_selector_background_right;
extern IMAGE img_gamer2_selector_background_left;
extern IMAGE img_gamer2_selector_background_right;

extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer2_idle_right;

extern IMAGE img_avatar_gamer1;
extern IMAGE img_avatar_gamer2;

extern SceneManager scene_manager;

class SelectorScene : public Scene
{
public:
	SelectorScene() = default;
	~SelectorScene() = default;

	virtual void on_enter() 
	{
		this->m_animation_gamer1.setAtlas(&atlas_gamer1_idle_right);
		this->m_animation_gamer2.setAtlas(&atlas_gamer2_idle_right);
		this->m_animation_gamer1.setInterval(100);
		this->m_animation_gamer2.setInterval(100);

		static const int OFFSET_X = 50;

		this->pos_img_VS.x = (getwidth() - img_VS.getwidth()) / 2;
		this->pos_img_VS.y = (getheight() - img_VS.getheight()) / 2;
		this->pos_img_tip.x = (getwidth() - img_selector_tip.getwidth()) / 2;
		this->pos_img_tip.y = getheight() - 125;
		this->pos_img_1P.x = (getwidth() / 2 - img_1P.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P.y = 35;
		this->pos_img_2P.x = getwidth() / 2 + (getwidth() / 2 - img_2P.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P.y = this->pos_img_1P.y;
		this->pos_img_1P_desc.x = (getwidth() / 2 - img_1P_desc.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P_desc.y = getheight() - 150;
		this->pos_img_2P_desc.x = getwidth() / 2 + (getwidth() / 2 - img_2P_desc.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P_desc.y = this->pos_img_1P_desc.y;
		this->pos_img_1P_select_background.x = (getwidth() / 2 - img_select_background_right.getwidth()) / 2 - OFFSET_X;
		this->pos_img_1P_select_background.y = this->pos_img_1P.y + img_1P.getwidth() + 35;
		this->pos_img_2P_select_background.x = getwidth() / 2 + (getwidth() / 2 - img_select_background_left.getwidth()) / 2 + OFFSET_X;
		this->pos_img_2P_select_background.y = this->pos_img_1P_select_background.y;
		this->pos_animation_1P.x = (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 - OFFSET_X;
		this->pos_animation_1P.y = this->pos_img_1P_select_background.y + 80;
		this->pos_animation_2P.x = getwidth() / 2 + (getwidth() / 2 - atlas_gamer1_idle_right.getImage(0)->getwidth()) / 2 + OFFSET_X;
		this->pos_animation_2P.y = this->pos_animation_1P.y;
		this->pos_img_1P_name.y = this->pos_animation_1P.y + 155;
		this->pos_img_2P_name.y = this->pos_img_1P_name.y;
		this->pos_1P_selector_btn_left.x = this->pos_img_1P_select_background.x - img_1P_selector_btn_idle_left.getwidth();
		this->pos_1P_selector_btn_left.y = this->pos_img_1P_select_background.y + (img_select_background_right.getheight() - img_1P_selector_btn_idle_left.getheight()) / 2;
		this->pos_1P_selector_btn_right.x = this->pos_img_1P_select_background.x + img_select_background_right.getwidth();
		this->pos_1P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;
		this->pos_2P_selector_btn_left.x = this->pos_img_2P_select_background.x - img_2P_selector_btn_idle_left.getwidth();
		this->pos_2P_selector_btn_left.y = this->pos_1P_selector_btn_left.y;
		this->pos_2P_selector_btn_right.x = this->pos_img_2P_select_background.x + img_select_background_left.getwidth();
		this->pos_2P_selector_btn_right.y = this->pos_1P_selector_btn_left.y;
	}

	virtual void on_update(int delta)
	{
		this->m_animation_gamer1.on_update(delta);
		this->m_animation_gamer2.on_update(delta);

		this->m_selector_background_scorll_offset_x += 5;
		if (this->m_selector_background_scorll_offset_x >= img_gamer1_selector_background_left.getwidth())
		{
			this->m_selector_background_scorll_offset_x -= img_gamer1_selector_background_left.getwidth();
		}
	}

	virtual void on_draw(const Camera& camera)
	{
		IMAGE* imgptr_P1_seletor_background = nullptr;
		IMAGE* imgptr_P2_seletor_background = nullptr;

		switch (this->m_player_type_1)
		{
		case PlayerType::Gamer1:
			imgptr_P1_seletor_background = &img_gamer1_selector_background_left;
			break;
		case PlayerType::Gamer2:
			imgptr_P1_seletor_background = &img_gamer2_selector_background_left;
			break;
		default:
			imgptr_P1_seletor_background = &img_gamer1_selector_background_left;
			break;
		}

		switch (this->m_player_type_2)
		{
		case PlayerType::Gamer1:
			imgptr_P2_seletor_background = &img_gamer1_selector_background_left;
			break;
		case PlayerType::Gamer2:
			imgptr_P2_seletor_background = &img_gamer2_selector_background_left;
			break;
		default:
			imgptr_P2_seletor_background = &img_gamer1_selector_background_left;
			break;
		}

		putimage(0, 0, &img_selector_background);

		putImageAlpha(this->m_selector_background_scorll_offset_x - imgptr_P1_seletor_background->getwidth(), 0, imgptr_P1_seletor_background);
		putImageAlpha(this->m_selector_background_scorll_offset_x, 0, imgptr_P1_seletor_background->getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P1_seletor_background, 0, 0);
		putImageAlpha(getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P2_seletor_background);
		putImageAlpha(getwidth() - imgptr_P2_seletor_background->getwidth(), 0, imgptr_P2_seletor_background->getwidth() - this->m_selector_background_scorll_offset_x, 0, imgptr_P2_seletor_background, this->m_selector_background_scorll_offset_x, 0);

		putImageAlpha(this->pos_img_VS.x, this->pos_img_VS.y, &img_VS);

		putImageAlpha(this->pos_img_1P.x, this->pos_img_1P.y, &img_1P);
		putImageAlpha(this->pos_img_2P.x, this->pos_img_2P.y, &img_2P);
		putImageAlpha(this->pos_img_1P_select_background.x, this->pos_img_1P_select_background.y, &img_select_background_right);
		putImageAlpha(this->pos_img_2P_select_background.x, this->pos_img_2P_select_background.y, &img_select_background_left);

		switch (this->m_player_type_1)
		{
		case PlayerType::Gamer1:
			this->m_animation_gamer1.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
			this->pos_img_1P_name.x = this->pos_img_1P_select_background.x + (img_select_background_right.getwidth() - textwidth(this->str_gamer1_name)) / 2;
			this->outtextxy_shaded(this->pos_img_1P_name.x, this->pos_img_1P_name.y, this->str_gamer1_name);
			break;
		case PlayerType::Gamer2:
			this->m_animation_gamer2.on_draw(camera, this->pos_animation_1P.x, this->pos_animation_1P.y);
			this->pos_img_1P_name.x = this->pos_img_1P_select_background.x + (img_select_background_right.getwidth() - textwidth(this->str_gamer2_name)) / 2;
			this->outtextxy_shaded(this->pos_img_1P_name.x, this->pos_img_1P_name.y, this->str_gamer2_name);
			break;
		}
		
		switch (this->m_player_type_2)
		{
		case PlayerType::Gamer1:
			this->m_animation_gamer1.on_draw(camera, this->pos_animation_2P.x, this->pos_animation_2P.y);
			this->pos_img_2P_name.x = this->pos_img_2P_select_background.x + (img_select_background_left.getwidth() - textwidth(this->str_gamer1_name)) / 2;
			this->outtextxy_shaded(this->pos_img_2P_name.x, this->pos_img_2P_name.y, this->str_gamer1_name);
			break;
		case PlayerType::Gamer2:
			this->m_animation_gamer2.on_draw(camera, this->pos_animation_2P.x, this->pos_animation_2P.y);
			this->pos_img_2P_name.x = this->pos_img_2P_select_background.x + (img_select_background_left.getwidth() - textwidth(this->str_gamer2_name)) / 2;
			this->outtextxy_shaded(this->pos_img_2P_name.x, this->pos_img_2P_name.y, this->str_gamer2_name);
			break;
		}

		putImageAlpha(this->pos_1P_selector_btn_left.x, this->pos_1P_selector_btn_left.y, this->is_btn_1P_left_down ? &img_1P_selector_btn_down_left : &img_1P_selector_btn_idle_left);
		putImageAlpha(this->pos_1P_selector_btn_right.x, this->pos_1P_selector_btn_right.y, this->is_btn_1P_right_down ? &img_1P_selector_btn_down_right : &img_1P_selector_btn_idle_right);
		putImageAlpha(this->pos_2P_selector_btn_left.x, this->pos_2P_selector_btn_left.y, this->is_btn_2P_left_down ? &img_2P_selector_btn_down_left : &img_2P_selector_btn_idle_left);
		putImageAlpha(this->pos_2P_selector_btn_right.x, this->pos_2P_selector_btn_right.y, this->is_btn_2P_right_down ? &img_2P_selector_btn_down_right : &img_2P_selector_btn_idle_right);

		putImageAlpha(this->pos_img_1P_desc.x, this->pos_img_1P_desc.y, &img_1P_desc);
		putImageAlpha(this->pos_img_2P_desc.x, this->pos_img_2P_desc.y, &img_2P_desc);

		putImageAlpha(this->pos_img_tip.x, this->pos_img_tip.y, &img_selector_tip);
	}

	virtual void on_input(const ExMessage& msg)
	{
		switch (msg.message)
		{
		case WM_KEYDOWN:
			switch (msg.vkcode)
			{
			case 0x41://'A'
				this->is_btn_1P_left_down = true;
				break;
			case 0x44://'D'
				this->is_btn_1P_right_down = true;
				break;
			case VK_LEFT://'←'
				this->is_btn_2P_left_down = true;
				break;
			case VK_RIGHT://'→'
				this->is_btn_2P_right_down = true;
				break;
			}
			break;
		case WM_KEYUP:
			switch (msg.vkcode)
			{
			case 0x41://'A'
				this->is_btn_1P_left_down = false;
				this->m_player_type_1 = (PlayerType)(((int)PlayerType::Invalid + (int)this->m_player_type_1 - 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case 0x44://'D'
				this->is_btn_1P_right_down = false;
				this->m_player_type_1 = (PlayerType)(((int)this->m_player_type_1 + 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case VK_LEFT://'←'
				this->is_btn_2P_left_down = false;
				this->m_player_type_2 = (PlayerType)(((int)PlayerType::Invalid + (int)this->m_player_type_2 - 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case VK_RIGHT://'→'
				this->is_btn_2P_right_down = false;
				this->m_player_type_2 = (PlayerType)(((int)this->m_player_type_2 + 1) % (int)PlayerType::Invalid);
				mciSendString(L"play ui_switch from 0", NULL, 0, NULL);
				break;
			case VK_RETURN:
				scene_manager.switchTo(SceneManager::SceneType::Game);
				mciSendString(L"play ui_confirm from 0", NULL, 0, NULL);
				break;
			}
			break;
		default:
			break;
		}
	}

	virtual void on_exit()
	{
		switch (this->m_player_type_1)
		{
		case PlayerType::Gamer1:
			player_1 = new PlayerGamer1();
			break;
		case PlayerType::Gamer2:
			player_1 = new PlayerGamer2();
			break;
		}
		player_1->setId(PlayerId::P1);

		switch (this->m_player_type_2)
		{
		case PlayerType::Gamer1:
			player_2 = new PlayerGamer1();
			break;
		case PlayerType::Gamer2:
			player_2 = new PlayerGamer2();
			break;
		}
		player_2->setId(PlayerId::P2);
	}

private:
	void outtextxy_shaded(int x, int y, LPCTSTR str)
	{
		settextcolor(RGB(45, 45, 45));
		outtextxy(x + 3, y + 3, str);
		settextcolor(RGB(255, 255, 255));
		outtextxy(x, y, str);
	}

private:
	enum class PlayerType
	{
		Gamer1,
		Gamer2,
		Invalid
	};

private:
	bool is_btn_1P_left_down = false;
	bool is_btn_1P_right_down = false;
	bool is_btn_2P_left_down = false;
	bool is_btn_2P_right_down = false;

private:
	POINT pos_img_VS = { 0 };
	POINT pos_img_tip = { 0 };
	POINT pos_img_1P = { 0 };
	POINT pos_img_2P = { 0 };
	POINT pos_img_1P_desc = { 0 };
	POINT pos_img_2P_desc = { 0 };
	POINT pos_img_1P_name = { 0 };
	POINT pos_img_2P_name = { 0 };
	POINT pos_animation_1P = { 0 };
	POINT pos_animation_2P = { 0 };
	POINT pos_img_1P_select_background = { 0 };
	POINT pos_img_2P_select_background = { 0 };
	POINT pos_1P_selector_btn_left = { 0 };
	POINT pos_2P_selector_btn_left = { 0 };
	POINT pos_1P_selector_btn_right = { 0 };
	POINT pos_2P_selector_btn_right = { 0 };

	Animation m_animation_gamer1;
	Animation m_animation_gamer2;

	PlayerType m_player_type_1 = PlayerType::Gamer1;
	PlayerType m_player_type_2 = PlayerType::Gamer2;

	LPCTSTR str_gamer1_name = L" 角色 1 ";
	LPCTSTR str_gamer2_name = L" 角色 2 ";

	int m_selector_background_scorll_offset_x = 0;

};

#endif
```



## 第十节

### 简单物理实现——移动

首先先将上节未完成的部分代码完成，按键按下进行动画的切换的功能已经完成，下一步就是修改角色的坐标来达成移动的效果了，在player.h中的类内添加run_velocity变量表示其水平移动速度，在on_update中将其与时间相乘记为移动距离对坐标进行更新，不过我们希望封装跑步方法使其更加方便进行管理，所以在Player类中定义on_run方法，传入移动距离作为变量在玩家水平位置进行修改，运行程序可以看到角色悬浮空中按下左右键即可左右移动：

```
//player.h中Player类内成员变量
const float run_velocity = 0.55f;//水平移动速度

//player.h中Player类内on_update
if (direction != 0)
{
	this->is_facing_right = direction > 0;
	this->m_current_animaiton = is_facing_right ? &this->m_animation_run_right : &this->m_animation_run_left;
	//=====修改部分=====
	float distance = direction * this->run_velocity * delta;
	this->on_run(distance);
	//=====修改部分=====
}

//Player创建on_run
void on_run(float destance) 
{
	this->m_position.m_x += destance;
}

```



由于我们的项目中平台类型均为单项碰撞的模式，玩家可以从平台下方越过降落到平台上方但是无法从上方穿越到下方，这一部分依然涉及到一些相对抽象的数据逻辑，我们慢慢来一步一步完成。



### 简单物理实现——重力模拟

由于整个物理中模拟中重力通常由速度与加速度影响，所以先在Player类中定义gravity常量表示所受重力，需要注意的是在程序中所受重力需要符合直觉，人物身体比例与现实比例不一致所以此处的重力加速度也不一定为9.8可能会小得多，只要看上去符合当前情景的重力的情况即可，同时还需要添加保存速度的变量velocity，随后定义moveAndCollide函数用于处理后续物理相关代码。

首先是根据重力加速度值对玩家速度进行累加，随后根据速度更新玩家位置并在on_update中调用碰撞更新部分，运行程序就可以看到玩家开始进行下落，由此我们可以开始单向碰撞的代码部分了：

```
//Player类内声明变量
const float gravity = 0.0016f;//重力加速度

Vector2 m_velocity;

//moveAndCollide代码
void moveAndCollide(int delta)
{
    this->m_velocity.m_y += this->gravity * delta;
    this->m_position += this->m_velocity * delta;
}

//on_update最后最后调用moveAndCollide
this->moveAndCollide(delta);

```



由于可以从底部穿过平台而无法从顶部落下到底部，所以和平台的碰撞只需要在玩家下坠时也就是速度向下时检测平台即可，并且由于需要获取到场景中所有平台对象，所以在全局区引入platform.h头文件并通过extern获取所有平台列表，这样就可以遍历每一个平台并获取到其碰撞外形了，但是如何定义碰撞呢？

既然已经定义了玩家的位置属性那么只需要添加一个size二维向量描述玩家尺寸即可实现玩家矩形碰撞箱了，而碰撞原理也很好解释，由于是矩形与线的碰撞只需要将二者的右左边界值做差比较即可，如果结果小于二者宽度和则说明有重合部分否者没有重合部分，而竖直方向只需要平台检测线的y坐标处于玩家矩形上边界和下边界之间即可判断了，当水平与竖直均发生碰撞，则我们可以确定二者发生了碰撞。

那么就可以做坐标修正了，如果只是简单的将发生碰撞就将玩家坐标修正到平台上就会出现，明明只是刚刚好头顶碰到平台结果却瞬移到平台上的错误情况，那么如何修正整个方法，只需要获取上一帧玩家脚底位置只有其在平台上方并满足之前所讨论的所有条件，才应该执行坐标修正，同时不要忘记在各自实现中初始化size大小：

```
//player.h全局区声明引入资源
#include "platform.h"

extern std::vector<Platform> platform_list;

//Player成员变量添加玩家尺寸
Vector2 m_size;

//moveAndCollide平台碰撞
void moveAndCollide(int delta)
{
	this->m_velocity.m_y += this->gravity * delta;
	this->m_position += this->m_velocity * delta;

	if (this->m_velocity.m_y > 0)
	{
		for (const Platform& pt : platform_list)
		{
			const Platform::CollisionShape& shape = pt.m_shape;

			bool is_collide_x = (max(this->m_position.m_x + this->m_size.m_x, shape.right) - min(this->m_position.m_x, shape.left) <= this->m_size.m_x + (shape.right - shape.left));
			bool is_collide_y = (shape.y >= this->m_position.m_y && shape.y <= this->m_position.m_y + this->m_size.m_y);

			if (is_collide_x && is_collide_y)
			{
				float delta_pos_y = this->m_velocity.m_y * delta;
				float last_tick_foot_pos_y = this->m_position.m_y + this->m_size.m_y - delta_pos_y;
				if (last_tick_foot_pos_y <= shape.y)
				{
					this->m_position.m_y = shape.y - this->m_size.m_y;
					this->m_velocity.m_y = 0;

					return;
				}
			}
		}
	}
}

//playerGamer1.h中PlayerGamer1构造函数
this->m_size.m_x = 96;
this->m_size.m_y = 96;

//playerGamer2.h中PlayerGamer2构造函数
this->m_size.m_x = 96;
this->m_size.m_y = 96;

```



最后是完成跳跃逻辑，在player.h中定义on_jump方法，此时来到on_input中即可在1P按下W时与2P按下↑时调用on_jump方法，接下来即可填充on_jump逻辑。

```
//on_input中的WM_KEYDOWN中的1P
case 0x57://'W'
    this->on_jump();
    break;

//on_input中的WM_KEYDOWN中的1P
case VK_UP://↑
	this->on_jump();
	break;

```



首先声明成员变量jump_velocity保存玩家跳跃速度，随后修改on_jump中速度直接增加跳跃速度即可，但是运行会发现，如果玩家疯狂敲击跳跃键则会直接升天，为了避免我们使用速度为0来充当必要条件，只有玩家竖直速度为0时才可以继续执行跳跃逻辑，运行程序正确执行了所需功能逻辑：

```
//成员变量声明
const float jump_velocity = -0.85f;//跳跃速度

//on_jump声明
void on_jump()
{
	if (this->m_velocity.m_y != 0) return;

	this->m_velocity.m_y += this->jump_velocity;
}

```



## 第十节完成代码展示

**player.h**

```
#ifndef _PLAYER_H_
#define _PLAYER_H_

#include "camera.h"
#include "vector2.h"
#include "animation.h"
#include "playerId.h"
#include "platform.h"

#include <graphics.h>

extern std::vector<Platform> platform_list;

class Player
{
public:
	Player()
	{
		this->m_current_animaiton = &this->m_animation_idle_right;
	}

	~Player() = default;

	virtual void on_update(int delta)
	{
		int direction = this->is_right_keydown - this->is_left_keydown;

		if (direction != 0)
		{
			this->is_facing_right = direction > 0;
			this->m_current_animaiton = is_facing_right ? &this->m_animation_run_right : &this->m_animation_run_left;
			
			float distance = direction * this->run_velocity * delta;
			this->on_run(distance);

		}
		else
		{
			this->m_current_animaiton = is_facing_right ? &this->m_animation_idle_right : &this->m_animation_idle_left;
		}

		this->m_current_animaiton->on_update(delta);
		this->moveAndCollide(delta);
	}

	virtual void on_draw(const Camera& camera)
	{
		this->m_current_animaiton->on_draw(camera, this->m_position.m_x, this->m_position.m_y);
	}

	virtual void on_input(const ExMessage& msg)
	{
		switch (msg.message)
		{
		case WM_KEYDOWN:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = true;
					break;
				case 0x44://'D'
					this->is_right_keydown = true;
					break;
				case 0x57://'W'
					this->on_jump();
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = true;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = true;
					break;
				case VK_UP://'↑'
					this->on_jump();
					break;
				}
				break;
			}
			break;
		case WM_KEYUP:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = false;
					break;
				case 0x44://'D'
					this->is_right_keydown = false;
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = false;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = false;
					break;
				}
				break;
			}
			break;
		}
	}

	void on_jump()
	{
		if (this->m_velocity.m_y != 0) return;

		this->m_velocity.m_y += this->jump_velocity;
	}

	void on_run(float destance) 
	{
		this->m_position.m_x += destance;
	}

	void moveAndCollide(int delta)
	{
		this->m_velocity.m_y += this->gravity * delta;
		this->m_position += this->m_velocity * (float)delta;

		if (this->m_velocity.m_y > 0)
		{
			for (const Platform& pt : platform_list)
			{
				const Platform::CollisionShape& shape = pt.m_shape;

				bool is_collide_x = (max(this->m_position.m_x + this->m_size.m_x, shape.right) - min(this->m_position.m_x, shape.left) <= this->m_size.m_x + (shape.right - shape.left));
				bool is_collide_y = (shape.y >= this->m_position.m_y && shape.y <= this->m_position.m_y + this->m_size.m_y);

				if (is_collide_x && is_collide_y)
				{
					float delta_pos_y = this->m_velocity.m_y * delta;
					float last_tick_foot_pos_y = this->m_position.m_y + this->m_size.m_y - delta_pos_y;
					if (last_tick_foot_pos_y <= shape.y)
					{
						this->m_position.m_y = shape.y - this->m_size.m_y;
						this->m_velocity.m_y = 0;

						break;
					}
				}
			}
		}
	}

	void setId(PlayerId id) { this->m_id = id; }

	void setPosition(int x, int y) { this->m_position.m_x = x, this->m_position.m_y = y; }

protected:
	Vector2 m_size;
	Vector2 m_position;
	Vector2 m_velocity;

	Animation m_animation_idle_left;
	Animation m_animation_idle_right;
	Animation m_animation_run_left;
	Animation m_animation_run_right;

	Animation* m_current_animaiton = nullptr;

	PlayerId m_id;

	const float run_velocity = 0.55f;//水平移动速度
	const float gravity = 0.0016f;//重力加速度
	const float jump_velocity = -0.85f;//跳跃速度

	bool is_left_keydown = false;
	bool is_right_keydown = false;

	bool is_facing_right = true;

};

#endif // !_PLAYER_H_

```

**playerGamer1.h**

```
#ifndef _PLAYERGAMER1_H_
#define _PLAYERGAMER1_H_

#include "player.h"

#include <iostream>

extern Atlas atlas_gamer1_idle_left;
extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer1_run_left;
extern Atlas atlas_gamer1_run_right;

class PlayerGamer1 : public Player
{
public:
	PlayerGamer1()
	{
		this->m_animation_idle_left.setAtlas(&atlas_gamer1_idle_left);
		this->m_animation_idle_right.setAtlas(&atlas_gamer1_idle_right);
		this->m_animation_run_left.setAtlas(&atlas_gamer1_run_left);
		this->m_animation_run_right.setAtlas(&atlas_gamer1_run_right);

		this->m_animation_idle_left.setInterval(75);
		this->m_animation_idle_right.setInterval(75);
		this->m_animation_run_left.setInterval(75);
		this->m_animation_run_right.setInterval(75);

		this->m_size.m_x = 96;
		this->m_size.m_y = 96;
	}

	~PlayerGamer1() = default;

	virtual void on_update(int delta)
	{
		Player::on_update(delta);
		std::cout << "Gamer1 on update..." << std::endl;
	}

};

#endif // !_PLAYERGAMER1_H_

```

**playerGamer2.h**

```
#ifndef _PLAYERGAMER2_H_
#define _PLAYERGAMER2_H_

#include "player.h"

#include <iostream>

extern Atlas atlas_gamer2_idle_left;
extern Atlas atlas_gamer2_idle_right;
extern Atlas atlas_gamer2_run_left;
extern Atlas atlas_gamer2_run_right;

class PlayerGamer2 : public Player
{
public:
	PlayerGamer2()
	{
		this->m_animation_idle_left.setAtlas(&atlas_gamer2_idle_left);
		this->m_animation_idle_right.setAtlas(&atlas_gamer2_idle_right);
		this->m_animation_run_left.setAtlas(&atlas_gamer2_run_left);
		this->m_animation_run_right.setAtlas(&atlas_gamer2_run_right);

		this->m_animation_idle_left.setInterval(75);
		this->m_animation_idle_right.setInterval(75);
		this->m_animation_run_left.setInterval(75);
		this->m_animation_run_right.setInterval(75);

		this->m_size.m_x = 96;
		this->m_size.m_y = 96;
	}

	~PlayerGamer2() = default;

	virtual void on_update(int delta)
	{
		Player::on_update(delta);
		std::cout << "Gamer2 on update..." << std::endl;
	}

};

#endif // !_PLAYERGAMER2_H_
```



## 第十一节

### 子弹类基类编写

项目中角色1使用直线子弹抛物线攻击，角色2使用类似开口向下一元二次方程子弹抛物线攻击，总的来说都是使用抛物线进行攻击，那么就可以将其封装类后去实现他，首先创建筛选器bullet并创建文件：bullet.h，gamer1Bullet.h，gamer2Bullet.h，gamer2BulletEx.h。

随后填充bullet基类，创建Bullet类并引入vector2头文件并定义成员变量size碰撞项与position位置velocity速度，以及添加int成员变量damage伤害，其造成碰撞后的回调函数m_callback也需要声明，最后为防止自己发出的子弹对自己造成伤害，引入playerId头文件声明m_target_id子弹碰撞目标玩家ID，以此就可以描述本项目所有子弹类型。

最后是向外提供的方法函数，首先是damage伤害与position坐标的设置set方法与获取get方法，以及在碰撞时可能会使用到碰撞箱需要getSize方法，随后是碰撞目标m_collide_target设置和获取方法get与set方法，子弹碰撞方法只要保存在回调函数内部即可，以及最后get和set子弹是否可以继续碰撞vaild的方法，和查看是否可被移除方法checkCanRemove方便在释放子弹资源阶段使用。

接下来就可以开始着手开始编写虚函数重写部分代码了，首先是on_collide方法用于在发生碰撞时调用，随后是checkCollide方法用于检测子弹是否与指定位置和尺寸目标发生碰撞（为了不过分严格，判断方法为子弹对象矩形中心位置坐标是否进入判断对象内部），以及最后渲染和更新方法on_update和on_draw。

子弹的销毁除了命中目标外，离开屏幕也可以作为销毁的条件之一（注意离开的方向以及条件，避免抛物抛出上方结果消失的情况，不过此处不详细解释），这一部分同样可以作为继承自Bullet逻辑的子类通用逻辑，所以在portected中定义checkIfExceedScreen方法判断是否离开屏幕判断：

```
#ifndef _BULLET_H_
#define _BULLET_H_

#include "vector2.h"
#include "playerId.h"
#include "camera.h"

#include <functional>
#include <graphics.h>

class Bullet
{
public:
	Bullet() = default;
	~Bullet() = default;

	virtual void on_collide()
	{
		if (this->m_callback) this->m_callback();
	}

	virtual bool checkCollide(const Vector2& position, const Vector2& size)
	{
		return this->m_position.m_x + this->m_size.m_x / 2 >= position.m_x &&
			this->m_position.m_x + this->m_size.m_x / 2 <= position.m_x + size.m_x && 
			this->m_position.m_y + this->m_size.m_y / 2 >= position.m_y && 
			this->m_position.m_y + this->m_size.m_y / 2 <= position.m_y + size.m_y;
	}

	virtual void on_update(int delta)
	{
	}

	virtual void on_draw(const Camera& camera) const
	{
	}

	int getDamage() { return this->m_damage; }

	const Vector2& getPosition() { return this->m_position; }

	const Vector2& getSize() { return this->m_size; }

	PlayerId getCollideTarget() const { return this->m_target_id; }

	bool getValid() { return this->is_valid; }

	bool checkCanRemove() const { return this->can_remove; }

	void setCallback(std::function<void()> callback) { this->m_callback = callback; }

	void setDamage(int damage) { this->m_damage = damage; }

	void setPosition(float x, float y) { this->m_position.m_x = x, this->m_position.m_y = y; }

	void setVelocity(float x, float y) { this->m_velocity.m_x = x, this->m_velocity.m_y = y; }

	void setCollideTarget(PlayerId target) { this->m_target_id = target; }

	void setValid(bool is_valid) { this->is_valid = is_valid; }

protected:
	bool checkIfExceedScreen()
	{
		return (this->m_position.m_x + this->m_size.m_x <= 0 || this->m_position.m_x > getwidth() || 
			this->m_position.m_y + this->m_size.m_y <= 0 || this->m_position.m_y > getheight());
	}

protected:
	Vector2 m_size;
	Vector2 m_position;
	Vector2 m_velocity;

	int m_damage = 10;
	
	bool is_valid = true;
	bool can_remove = false;

	std::function<void()> m_callback;

	PlayerId m_target_id = PlayerId::P1;

};

#endif
```



## 第十一节完成代码展示

**bullet.h**

```
#ifndef _BULLET_H_
#define _BULLET_H_

#include "vector2.h"
#include "playerId.h"
#include "camera.h"

#include <functional>
#include <graphics.h>

class Bullet
{
public:
	Bullet() = default;
	~Bullet() = default;

	virtual void on_collide()
	{
		if (this->m_callback) this->m_callback();
	}

	virtual bool checkCollide(const Vector2& position, const Vector2& size)
	{
		return this->m_position.m_x + this->m_size.m_x / 2 >= position.m_x &&
			this->m_position.m_x + this->m_size.m_x / 2 <= position.m_x + size.m_x && 
			this->m_position.m_y + this->m_size.m_y / 2 >= position.m_y && 
			this->m_position.m_y + this->m_size.m_y / 2 <= position.m_y + size.m_y;
	}

	virtual void on_update(int delta)
	{
	}

	virtual void on_draw(const Camera& camera) const
	{
	}

	int getDamage() { return this->m_damage; }

	const Vector2& getPosition() { return this->m_position; }

	const Vector2& getSize() { return this->m_size; }

	PlayerId getCollideTarget() const { return this->m_target_id; }

	bool getValid() { return this->is_valid; }

	bool checkCanRemove() const { return this->can_remove; }

	void setCallback(std::function<void()> callback) { this->m_callback = callback; }

	void setDamage(int damage) { this->m_damage = damage; }

	void setPosition(float x, float y) { this->m_position.m_x = x, this->m_position.m_y = y; }

	void setVelocity(float x, float y) { this->m_velocity.m_x = x, this->m_velocity.m_y = y; }

	void setCollideTarget(PlayerId target) { this->m_target_id = target; }

	void setValid(bool is_valid) { this->is_valid = is_valid; }

protected:
	bool checkIfExceedScreen()
	{
		return (this->m_position.m_x + this->m_size.m_x <= 0 || this->m_position.m_x > getwidth() || 
			this->m_position.m_y + this->m_size.m_y <= 0 || this->m_position.m_y > getheight());
	}

protected:
	Vector2 m_size;
	Vector2 m_position;
	Vector2 m_velocity;

	int m_damage = 10;
	
	bool is_valid = true;
	bool can_remove = false;

	std::function<void()> m_callback;

	PlayerId m_target_id = PlayerId::P1;

};

#endif

```



## 第十二节

### 玩家子弹派生类实现

由于设计中，决定给角色1攻击设计为直线子弹攻击，由于其只会发射一种类型子弹即直线运动子弹，扩展发射子弹仅仅只是发射频率不同而已，所以来到gamer1Bullet.h中定义Gamer1Bullet类描述角色1子弹，记得引入Bullet.h文件继承Bullet类，浏览资源文件可以发现我们准备了三份gamer1_bullet_break的mp3文件，这是在开发中非常常见的，我们会随机播放三种文件中一种的音效以提升效果。

这样我们就要重写子弹的on_collide的碰撞逻辑为子弹添加不同的破碎音效，虽然继承父类方法但是还是需要调用父类构造方法，也就是基类的on_collide方法，随后使用rand()方法获取随机数随后随机播放加载好的音效。

随后编写on_draw与on_update方法，由于子弹碰撞有动画所以需要引入Animation.h文件并在内部创建Animation成员变量m_animation_bullet_break，接下来来到on_update中根据时间和速度修改子弹位置，随后检查子弹是否失效来决定是否on_update更新动画，以及检查是否超出屏幕外部来设置是否可以被移除，然后就可以编写渲染部分，首先使用extern声明所需的图片和图集对象，并在on_draw中根据是否失效来决定绘制失效动画还是img图片，随后编写初始化逻辑设置制单尺寸为64*64大小矩形以及伤害为10，在对破碎动画进行详细配置包含atlas对象间隔时间100以及false循环loop设置，最后是callbak方法在破碎动画结束播放后修改can_move变量为true。

如此便完成了角色1的子弹类的编写，通过面向对象继承特效，只需要扩展独有的部分代码即可完成：

```
#ifndef _GAMER1_BULLET_H_
#define _GAMER1_BULLET_H_

#include "bullet.h"
#include "animation.h"

extern IMAGE img_gamer1_bullet;
extern Atlas atlas_gamer1_bullet_break;

class Gamer1Bullet : public Bullet
{
public:
	Gamer1Bullet() 
	{
		this->m_size.m_y = this->m_size.m_x = 64;
		this->m_damage = 10;

		this->m_animation_bullet_break.setAtlas(&atlas_gamer1_bullet_break);
		this->m_animation_bullet_break.setInterval(100);
		this->m_animation_bullet_break.setLoop(false);
		this->m_animation_bullet_break.setCallBack([&]() {this->can_remove = true; });
	}

	~Gamer1Bullet() = default;

	void on_collide()
	{
		Bullet::on_collide();

		switch (rand() % 3)
		{
		case 0:
			mciSendString(L"play gamer1_bullet_break_1 from 0", NULL, 0, NULL);
			break;
		case 1:
			mciSendString(L"play gamer1_bullet_break_2 from 0", NULL, 0, NULL);
			break;
		case 2:
			mciSendString(L"play gamer1_bullet_break_3 from 0", NULL, 0, NULL);
			break;
		default:
			break;
		}
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid)
		{
			putImageAlpha(camera, (int)this->m_position.m_x, (int)this->m_position.m_y, &img_gamer1_bullet);
		}
		else
		{
			this->m_animation_bullet_break.on_draw(camera, (int)this->m_position.m_x, (int)this->m_position.m_y);
		}
	}

	void on_update(int delta)
	{
		this->m_position += this->m_velocity * (float)delta;

		if (!this->is_valid)
		{
			this->m_animation_bullet_break.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	Animation m_animation_bullet_break;

};

#endif
```



随后来到gamer2Bullet.h头文件中开始编写角色2的子弹代码部分，同样是创建角色2子弹类引入bullet.h继承随后引入animation.h头文件后声明m_animation_idle和m_animation_explode以及一个比较特殊的Vector2类型的爆炸动画渲染偏移m_explode_rander_offset变量，这是因为爆炸动画通常的素材大小是大于子弹大小的，所以未来保证爆炸动画播放位置正确与子弹中心位置对其，我们声明了这个变量来对素材位置对齐使得播放效果正确完成。

构造中同样是设置子弹大小伤害，详细设置动画类随后计算偏移量，由于easyX中都是使用图片左上角作为原点，所以直接使用两者坐标差的一般即可得到正确偏移量了，最后是on_collide函数首先是执行基类碰撞检测，由于我们希望爆炸后使得画面进行抖动，所以来到代码头部引入main_camera声明外部的摄像头对象，随后便可调用摄像头的抖动功能shake进行画面摇晃了，以及注意添加播放爆炸音效。

随后是on_update部分，由于直线子弹与抛物子弹爆炸不一样，抛物线子弹爆炸后，爆炸效果需要保留在原地，所以需要先判断当前状态是否有效，随后定义成员变量m_gravity为0.001为子弹所受重力大小，随后若子弹有效，则根据重力修改其在竖直方向上的速度分量，再根据当前速度修改其位置坐标，随后根据是否有效来决定更新动画对象，最后标记屏幕外子弹为可移除，最后on_draw方法中根据是否有效决定绘制对象，注意添加位置偏移即可完成这一部分的代码：

```
#ifndef _GAMER2_BULLET_H_
#define _GAMER2_BULLET_H_

#include "bullet.h"
#include "animation.h"

extern Camera main_camera;

extern Atlas atlas_gemer2_bullet;
extern Atlas atlas_gemer2_bullet_explode;

class Gamer2Bullet : public Bullet
{
public:
	Gamer2Bullet() 
	{
		this->m_size.m_x = this->m_size.m_y = 96;
		this->m_damage = 20;
		
		this->m_animation_idle.setAtlas(&atlas_gemer2_bullet);
		this->m_animation_idle.setInterval(50);

		this->m_animation_explode.setAtlas(&atlas_gemer2_bullet_explode);
		this->m_animation_explode.setInterval(50);
		this->m_animation_explode.setLoop(false);
		this->m_animation_explode.setCallBack([&]() {this->can_remove = true; });

		IMAGE* frame_idle = this->m_animation_idle.getFrame();
		IMAGE* frame_explode = this->m_animation_explode.getFrame();

		this->m_explode_render_offset.m_x = (frame_idle->getwidth() - frame_explode->getwidth()) / 2.0f;
		this->m_explode_render_offset.m_y = (frame_idle->getheight() - frame_explode->getheight()) / 2.0f;

	}

	~Gamer2Bullet() = default;

	void on_collide()
	{
		Bullet::on_collide();

		main_camera.shake(5, 250);

		mciSendString(L"play gamer2_bullet_explode from 0", NULL, 0, NULL);
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid) 
		{
			this->m_animation_idle.on_draw(camera, this->m_position.m_x, this->m_position.m_y);
		}
		else
		{
			this->m_animation_explode.on_draw(camera, this->m_position.m_x + this->m_explode_render_offset.m_x, this->m_position.m_y + this->m_explode_render_offset.m_y);
		}
	}

	void on_update(int delta)
	{
		if (this->is_valid)
		{
			this->m_velocity.m_y += this->m_gravity * delta;
			this->m_position += this->m_velocity * (float)delta;
		}

		if (!this->is_valid)
		{
			this->m_animation_explode.on_update(delta);
		}
		else
		{
			this->m_animation_idle.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	const float m_gravity = 0.001f;

	Animation m_animation_idle;
	Animation m_animation_explode;
	Vector2 m_explode_render_offset;

};

#endif
```



最后是垂直下落的角色2扩展发色子弹为垂直下落且速度较慢封锁移动的效果，所以首先来到Gamer2BulletEx.h中声明Gamer2BulletEx类，引入animation.h头文件声明成员变量常态爆炸与偏移Vector2类型并引入Atlas图集与常规子弹无异，引入main_camera编写构造与on_collide方法，此处编写与常规子弹无异，但是注意常规子弹碰撞方法为中心碰撞，扩展子弹更大我们则希望其碰撞检测也更大，所以这里要重写checkCollision检查其x与y是否产生重合即可，随后是on_update部分因没有所受重力的变量所以去除该部分其他与子弹类基本相同，以及on_draw方法中的绘制，与原子弹类一致。

实际上扩展角色2子弹完全可以继承角色2子弹，但是此处展示使用相对扁平的类继承关系，确保代码结构不至于太过难理解：

```
#ifndef _GAMER2_BULLET_EX_H_
#define _GAMER2_BULLET_EX_H_

#include "bullet.h"
#include "animation.h"

extern Camera main_camera;

extern Atlas atlas_gamer2_bullet_ex;
extern Atlas atlas_gamer2_bullet_ex_explode;

class Gamer2BulletEx : public Bullet
{
public:
	Gamer2BulletEx()
	{
		this->m_size.m_x = this->m_size.m_y = 288;
		this->m_damage = 20;

		this->m_animation_idle.setAtlas(&atlas_gamer2_bullet_ex);
		this->m_animation_idle.setInterval(50);

		this->m_animation_explode.setAtlas(&atlas_gamer2_bullet_ex_explode);
		this->m_animation_explode.setInterval(50);
		this->m_animation_explode.setLoop(false);
		this->m_animation_explode.setCallBack([&]() {this->can_remove = true; });

		IMAGE* frame_idle = this->m_animation_idle.getFrame();
		IMAGE* frame_explode = this->m_animation_explode.getFrame();

		this->m_explode_render_offset.m_x = (frame_idle->getwidth() - frame_explode->getwidth()) / 2.0f;
		this->m_explode_render_offset.m_y = (frame_idle->getheight() - frame_explode->getheight()) / 2.0f;

	}

	~Gamer2BulletEx() = default;

	bool checkCollide(const Vector2& position, const Vector2& size)
	{
		bool is_collide_x = (max(this->m_position.m_x + this->m_size.m_x, position.m_x + size.m_x) - min(this->m_position.m_x, position.m_x) <= this->m_size.m_x + size.m_x);
		bool is_collide_y = (max(this->m_position.m_y + this->m_size.m_y, position.m_y + size.m_y) - min(this->m_position.m_y, position.m_y) <= this->m_size.m_y + size.m_y);

		return is_collide_x && is_collide_y;
	}

	void on_collide()
	{
		Bullet::on_collide();

		main_camera.shake(20, 250);

		mciSendString(L"play gamer2_bullet_explode_ex from 0", NULL, 0, NULL);
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid)
		{
			this->m_animation_idle.on_draw(camera, this->m_position.m_x, this->m_position.m_y);
		}
		else
		{
			this->m_animation_explode.on_draw(camera, this->m_position.m_x + this->m_explode_render_offset.m_x, this->m_position.m_y + this->m_explode_render_offset.m_y);
		}
	}

	void on_update(int delta)
	{
		if (this->is_valid)
		{
			this->m_position += this->m_velocity * (float)delta;
		}

		if (!this->is_valid)
		{
			this->m_animation_explode.on_update(delta);
		}
		else
		{
			this->m_animation_idle.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	Animation m_animation_idle;
	Animation m_animation_explode;
	Vector2 m_explode_render_offset;

};

#endif
```



## 第十二节完成代码展示

**gamer1Bullet.h**

```
#ifndef _GAMER1_BULLET_H_
#define _GAMER1_BULLET_H_

#include "bullet.h"
#include "animation.h"

extern IMAGE img_gamer1_bullet;
extern Atlas atlas_gamer1_bullet_break;

class Gamer1Bullet : public Bullet
{
public:
	Gamer1Bullet() 
	{
		this->m_size.m_y = this->m_size.m_x = 64;
		this->m_damage = 10;

		this->m_animation_bullet_break.setAtlas(&atlas_gamer1_bullet_break);
		this->m_animation_bullet_break.setInterval(100);
		this->m_animation_bullet_break.setLoop(false);
		this->m_animation_bullet_break.setCallBack([&]() {this->can_remove = true; });
	}

	~Gamer1Bullet() = default;

	void on_collide()
	{
		Bullet::on_collide();

		switch (rand() % 3)
		{
		case 0:
			mciSendString(L"play gamer1_bullet_break_1 from 0", NULL, 0, NULL);
			break;
		case 1:
			mciSendString(L"play gamer1_bullet_break_2 from 0", NULL, 0, NULL);
			break;
		case 2:
			mciSendString(L"play gamer1_bullet_break_3 from 0", NULL, 0, NULL);
			break;
		default:
			break;
		}
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid)
		{
			putImageAlpha(camera, (int)this->m_position.m_x, (int)this->m_position.m_y, &img_gamer1_bullet);
		}
		else
		{
			this->m_animation_bullet_break.on_draw(camera, (int)this->m_position.m_x, (int)this->m_position.m_y);
		}
	}

	void on_update(int delta)
	{
		this->m_position += this->m_velocity * (float)delta;

		if (!this->is_valid)
		{
			this->m_animation_bullet_break.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	Animation m_animation_bullet_break;

};

#endif
```

**gamer2Bullet.h**

```
#ifndef _GAMER2_BULLET_H_
#define _GAMER2_BULLET_H_

#include "bullet.h"
#include "animation.h"

extern Camera main_camera;

extern Atlas atlas_gemer2_bullet;
extern Atlas atlas_gemer2_bullet_explode;

class Gamer2Bullet : public Bullet
{
public:
	Gamer2Bullet() 
	{
		this->m_size.m_x = this->m_size.m_y = 96;
		this->m_damage = 20;
		
		this->m_animation_idle.setAtlas(&atlas_gemer2_bullet);
		this->m_animation_idle.setInterval(50);

		this->m_animation_explode.setAtlas(&atlas_gemer2_bullet_explode);
		this->m_animation_explode.setInterval(50);
		this->m_animation_explode.setLoop(false);
		this->m_animation_explode.setCallBack([&]() {this->can_remove = true; });

		IMAGE* frame_idle = this->m_animation_idle.getFrame();
		IMAGE* frame_explode = this->m_animation_explode.getFrame();

		this->m_explode_render_offset.m_x = (frame_idle->getwidth() - frame_explode->getwidth()) / 2.0f;
		this->m_explode_render_offset.m_y = (frame_idle->getheight() - frame_explode->getheight()) / 2.0f;

	}

	~Gamer2Bullet() = default;

	void on_collide()
	{
		Bullet::on_collide();

		main_camera.shake(5, 250);

		mciSendString(L"play gamer2_bullet_explode from 0", NULL, 0, NULL);
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid) 
		{
			this->m_animation_idle.on_draw(camera, this->m_position.m_x, this->m_position.m_y);
		}
		else
		{
			this->m_animation_explode.on_draw(camera, this->m_position.m_x + this->m_explode_render_offset.m_x, this->m_position.m_y + this->m_explode_render_offset.m_y);
		}
	}

	void on_update(int delta)
	{
		if (this->is_valid)
		{
			this->m_velocity.m_y += this->m_gravity * delta;
			this->m_position += this->m_velocity * (float)delta;
		}

		if (!this->is_valid)
		{
			this->m_animation_explode.on_update(delta);
		}
		else
		{
			this->m_animation_idle.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	const float m_gravity = 0.001f;

	Animation m_animation_idle;
	Animation m_animation_explode;
	Vector2 m_explode_render_offset;

};

#endif
```

**gamer2BulletEx.h**

```
#ifndef _GAMER2_BULLET_EX_H_
#define _GAMER2_BULLET_EX_H_

#include "bullet.h"
#include "animation.h"

extern Camera main_camera;

extern Atlas atlas_gamer2_bullet_ex;
extern Atlas atlas_gamer2_bullet_ex_explode;

class Gamer2BulletEx : public Bullet
{
public:
	Gamer2BulletEx()
	{
		this->m_size.m_x = this->m_size.m_y = 288;
		this->m_damage = 20;

		this->m_animation_idle.setAtlas(&atlas_gamer2_bullet_ex);
		this->m_animation_idle.setInterval(50);

		this->m_animation_explode.setAtlas(&atlas_gamer2_bullet_ex_explode);
		this->m_animation_explode.setInterval(50);
		this->m_animation_explode.setLoop(false);
		this->m_animation_explode.setCallBack([&]() {this->can_remove = true; });

		IMAGE* frame_idle = this->m_animation_idle.getFrame();
		IMAGE* frame_explode = this->m_animation_explode.getFrame();

		this->m_explode_render_offset.m_x = (frame_idle->getwidth() - frame_explode->getwidth()) / 2.0f;
		this->m_explode_render_offset.m_y = (frame_idle->getheight() - frame_explode->getheight()) / 2.0f;

	}

	~Gamer2BulletEx() = default;

	bool checkCollide(const Vector2& position, const Vector2& size)
	{
		bool is_collide_x = (max(this->m_position.m_x + this->m_size.m_x, position.m_x + size.m_x) - min(this->m_position.m_x, position.m_x) <= this->m_size.m_x + size.m_x);
		bool is_collide_y = (max(this->m_position.m_y + this->m_size.m_y, position.m_y + size.m_y) - min(this->m_position.m_y, position.m_y) <= this->m_size.m_y + size.m_y);

		return is_collide_x && is_collide_y;
	}

	void on_collide()
	{
		Bullet::on_collide();

		main_camera.shake(20, 250);

		mciSendString(L"play gamer2_bullet_explode_ex from 0", NULL, 0, NULL);
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid)
		{
			this->m_animation_idle.on_draw(camera, this->m_position.m_x, this->m_position.m_y);
		}
		else
		{
			this->m_animation_explode.on_draw(camera, this->m_position.m_x + this->m_explode_render_offset.m_x, this->m_position.m_y + this->m_explode_render_offset.m_y);
		}
	}

	void on_update(int delta)
	{
		if (this->is_valid)
		{
			this->m_position += this->m_velocity * (float)delta;
		}

		if (!this->is_valid)
		{
			this->m_animation_explode.on_update(delta);
		}
		else
		{
			this->m_animation_idle.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	Animation m_animation_idle;
	Animation m_animation_explode;
	Vector2 m_explode_render_offset;

};

#endif
```



## 第十三节

### 子弹发射功能实现

仅仅只有子弹是不够的，如何产生子弹，如何发射子弹，发射何种子弹等等的内容共同组合成了技能系统。本节来完成子弹发射的功能实现。

首先来到player.h中，编写虚成员函数on_attack与on_attack_ex，子类只需要重写这两个方法即可进行攻击与扩展攻击，但是需要考虑其触发时机，对于普通攻击而言其触发时机显然由按键触发所以在按键按下后执行on_attack逻辑即可，但是这样不变成按的越快发射越快了吗，所以还需要设置攻击间隔，定义成员变量can_attack布尔类型变量以及一个Timer类型的m_timer_attack_cd变由于记录角色攻击冷却时间，最后是一个m_attack_cd变量标识攻击冷却毫秒数，每次攻击翻转及实际更改标识符，等待计时器结束后翻转标识符，按键按下时再次触发，由此即完成了攻击的逻辑。

（此处我认为由于按键按下后会在消息队列插入一个按下按键消息，此后长按才会持续触发按键按下消息，假设攻击间隔时间短于这个长按的空隔时间，就会产生第一发和第二发的间隔大于后续的每一发的间隔的情况，有点类似之前产生的移动停顿的问题，所以这里一个应该再定义一个is_attacking标记，按下标记true弹起标记false，触发条件为检查is_attacking是否为true来触发）

接下来再Player构造函数中初始化计时器并设定为单词触发以及回调函数在回调函数中can_attack修改为true，随后on_update中更新定时器的on_update代码，随后来带on_input方法中，对于玩家1按下F键进行攻击而玩家2使用.表示攻击，而扩展攻击则需要能量条满后才能进行攻击，所以成员变量声明角色能量与生命m_mp与m_hp。

（此处是使用的无标识符的方法，我对此修改了应该标记is_attack_keydown标记，对于按键按下直接修改这个标记即可，而攻击实际逻辑处理则是移至on_update开头了，逻辑是一样的，当标记为true表示当前按下了攻击，若当前可以攻击触发on_attack随后标记不可攻击并重设timer，此处玩家1和玩家2逻辑一致）

随后在on_input中添加处理逻辑，无非角色1和2的按键触发逻辑不同（使用G和，）其他逻辑一致，即判断m_mp是否大于等于100，随后归零并调用on_attack_ex方法。

```
//虚成员函数攻击方法
virtual void on_attack() {}
virtual void on_attack_ex() {}

//攻击相关成员变量
bool is_attack_keydown = false;
bool can_attack = true;
int m_attack_cd = 500;
Timer m_timer_attack_cd;

//构造方法初始化攻击间隔时钟
this->m_timer_attack_cd.setWaitTime(this->m_attack_cd);
this->m_timer_attack_cd.setOneShot(true);
this->m_timer_attack_cd.setCallback([&]() {this->can_attack = true; });

//on_input方法添加按键响应
virtual void on_input(const ExMessage& msg)
{
	switch (msg.message)
	{
	case WM_KEYDOWN:
		switch (this->m_id)
		{
		case PlayerId::P1:
			switch (msg.vkcode)
			{
			case 0x41://'A'
				this->is_left_keydown = true;
				break;
			case 0x44://'D'
				this->is_right_keydown = true;
				break;
			case 0x57://'W'
				this->on_jump();
				break;
			case 0x46://'F'
				this->is_attack_keydown = true;
				break;
			case 0x47://'G'
				if (this->m_mp >= 100) this->m_mp = 0, this->on_attack_ex();
				break;
			}
			break;
		case PlayerId::P2:
			switch (msg.vkcode)
			{
			case VK_LEFT://'←'
				this->is_left_keydown = true;
				break;
			case VK_RIGHT://'→'
				this->is_right_keydown = true;
				break;
			case VK_UP://'↑'
				this->on_jump();
				break;
			case VK_OEM_PERIOD://'.'
				this->is_attack_keydown = true;
				break;
			case VK_OEM_COMMA://','
				if (this->m_mp >= 100) this->m_mp = 0, this->on_attack_ex();
				break;
			}
			break;
		}
		break;
	case WM_KEYUP:
		switch (this->m_id)
		{
		case PlayerId::P1:
			switch (msg.vkcode)
			{
			case 0x41://'A'
				this->is_left_keydown = false;
				break;
			case 0x44://'D'
				this->is_right_keydown = false;
				break;
			case 0x46://'F'
				this->is_attack_keydown = false;
				break;
			}
			break;
		case PlayerId::P2:
			switch (msg.vkcode)
			{
			case VK_LEFT://'←'
				this->is_left_keydown = false;
				break;
			case VK_RIGHT://'→'
				this->is_right_keydown = false;
				break;
			case VK_OEM_PERIOD://'.'
				this->is_attack_keydown = false;
				break;
			}
			break;
		}
		break;
	}
}

//on_update中开头添加处理
if (this->is_attack_keydown)
	{
		if (this->can_attack)
		{
			this->on_attack();
			this->can_attack = false;
			this->m_timer_attack_cd.restart();
		}
	}
```



完成了基类编写，接下来就应该到子类中完成逻辑的补充了，首先来到playerGamer1.h中重写on_attack与on_attack_ex方法，由于角色1发射的只有直线子弹，所以选择封装创建子弹的spawnBullet1方法，通过传入float参数speed决定生成直线子弹的速度，随后引入gamer1Bullet.h即可开始在方法内部实例化子弹对象了。

首先实例化子弹，创建两个临时变量Vecctor2类型的bullet_position和bullet_velocity变量用于存储子弹坐标与速度，注意生成坐标位置不应该和角色坐标一致，期望的位置应该存在一定偏移当前的项目我们希望子弹初始位置紧贴角色面朝方向的边缘处，所以需要先获取子弹尺寸与朝向，随后计算得出实际生成位置，并对速度等属性其进行设置，并且注意设置子弹碰撞目标，最后是子弹发生碰撞后回调函数设置。

```
void spawnBullet1(float speed)
{
	Bullet* bullet = new Gamer1Bullet();

	Vector2 bullet_position, bullet_velocity;
	const Vector2& bullet_size = bullet->getSize();

	bullet_position.m_x = this->is_facing_right ? this->m_position.m_x + this->m_size.m_x - bullet_size.m_x / 2 : this->m_position.m_x - bullet_size.m_x / 2;
	bullet_position.m_y = this->m_position.m_y;

	bullet_velocity.m_x = this->is_facing_right ? speed : -speed;
	bullet_velocity.m_y = 0;

	bullet->setPosition(bullet_position.m_x, bullet_position.m_y);
	bullet->setVelocity(bullet_velocity.m_x, bullet_velocity.m_y);

	bullet->setCollideTarget(this->m_id == PlayerId::P1 ? PlayerId::P2 : PlayerId::P1);
	bullet->setCallback([&]() {this->m_mp += 25; });
}

```



随后考虑生成子弹存放何处，此处简单将其与平台类似存放于全局vector中，来到main.cpp中，引入bullet.h文件随后定义Bullet指针数组bullet_list回到player.h中即可使用extern声明获取到了，随后playerGamer1.h中在spawnBullet1末尾将创建完成的子弹添加到list中，如此完成整改子弹生成逻辑，随后只需在on_attack中调用封装好的子弹生成逻辑然后播放随机音效即可，注意由于需要速度参数，重写之前可以声明好成员变量子弹速度，如此普通攻击部分完成，接下来开始考虑特殊攻击部分。

```
//main.cpp中全局区添加代码
#include "bullet.h"
std::vector<Bullet*> bullet_list;

//player.h中全局区添加代码
#include "bullet.h"
extern std::vector<Bullet*> bullet_list;

//playerGamer1.h中在spawnBullet1末尾添加代码		bullet_list.push_back(bullet);

//playerGamer1.h中添加成员变量
private:
	const float speed_bullet = 0.75f;
	const float speed_bullet_ex = 1.5f;

//playerGamer1.h中重写on_attack方法
void on_attack()
{
	this->spawnBullet1(this->speed_bullet);

	switch (rand() % 2)
	{
	case 0:
		mciSendString(L"play gamer1_bullet_shoot_1 from 0", NULL, 0, NULL);
		break;
	case 1:
		mciSendString(L"play gamer1_bullet_shoot_2 from 0", NULL, 0, NULL);
		break;
	}
}

```



由于特殊攻击条件为能量满值所以无需记录其冷却时间，但特殊攻击为持续状态，希望处于该状态时角色不允许随意移动跳跃，所以在player.h中声明布尔类型变量标记是否处于特殊攻击状态，随后即可在on_run方法中先进行状态判断，随后再进行坐标变换，同理on_jump中也进行修改判断即可

```
//成员变量添加
bool is_attacking_ex = false;

//修改成员函数
void on_jump()
{
	if (this->m_velocity.m_y != 0 || this->is_attacking_ex) return;

	this->m_velocity.m_y += this->jump_velocity;
}

void on_run(float destance) 
{
	if (this->is_attacking_ex) return;

	this->m_position.m_x += destance;
}

```



接下来来到playerGamer1.h中编写两个定时器，控制角色特殊攻击退出与特殊攻击时子弹发射，以及可以添加一个常量标记特殊攻击持续时长，随后在构造中设置定时器以及赋值攻击间隔即可。

```
//成员变量添加
const int attack_ex_duration = 2500;

Timer m_timer_attack_ex;
Timer m_timer_spawn_bullet_ex;

//构造函数增加及赋值
this->m_timer_attack_ex.setWaitTime(this->attack_ex_duration);
this->m_timer_attack_ex.setOneShot(true);
this->m_timer_attack_ex.setCallback([&]() {this->is_attacking_ex = false; });

this->m_timer_spawn_bullet_ex.setWaitTime(100);
this->m_timer_spawn_bullet_ex.setOneShot(false);
this->m_timer_spawn_bullet_ex.setCallback([&]() {this->spawnBullet1(this->speed_bullet_ex); });

this->m_attack_cd = 100;
```



特殊攻击方法则是直接在调用特殊攻击函数时更改标记并重启计时器即可，由于特殊攻击时使用动画为额外动画，所以需要来到player.h中，添加角色向左向右特殊攻击动画的成员变量，这样就可以在角色1的特殊攻击后根据不同朝向重置不同接收状态了，并且播放其攻击音频，由于添加了动画就需要对新动画进行赋值。

在文件头部extern引入特殊攻击对应两套图集，随后初始化动画图集以及帧间隔，除此之外我们希望画面中，在角色1触发特殊攻击时画面抖动，所以在on_update中根据是否处于特殊攻击中来对摄像头抖动以及计时器进行更新，至此角色1的普通攻击与特殊攻击完成。

```
//player.h添加成员变量
Animation m_animation_attack_ex_left;
Animation m_animation_attack_ex_right;

//playerGamer1.h重写特殊攻击函数
void on_attack_ex()
{
    this->is_attacking_ex = true;
    this->m_timer_attack_ex.restart();
    
	mciSendString(L"play gamer1_bullet_shoot_ex from 500", NULL, 0, NULL);
}

//playerGamer1.h构造方法初始化
this->m_animation_attack_ex_left.setAtlas(&atlas_gamer1_attack_ex_left);
this->m_animation_attack_ex_right.setAtlas(&atlas_gamer1_attack_ex_right);
this->m_animation_attack_ex_left.setInterval(75);
this->m_animation_attack_ex_right.setInterval(75);

//playerGamer1.h更新on_update方法
virtual void on_update(int delta)
{
	Player::on_update(delta);

	if (this->is_attacking_ex)
	{
		main_camera.shake(5, 100);
		this->m_timer_attack_ex.on_updata(delta);
		this->m_timer_spawn_bullet_ex.on_updata(delta);
	}
}

```



在此基础上编写角色2方法简单的更多了，首先是在playerGamer2.h顶部引入所需要的图集和头文件，由于在角色2中特别地，在子弹位置添加了图片样式的文本，所以需要额外添加一个头部文本动画的成员变量，并且区别角色1的子弹角色2子弹使用抛物线以及垂直下落，所以定义两个常量设定抛物线速度以及下落速度，如此可以在构造方法中进行初始化操作，包括动画设置，回调设置，动画循环设置以及冷却设置，随后就可以在on_update中添加当文本可见是动画更新逻辑，又由于在绘制本体外新增了绘制文本的功能，所以需要额外编写on_draw的重写方法并在开头首先调用父类绘图方法，主体部分逻辑则是经典的判断是否需要绘制，计算绘制位置，进行绘制的步骤。

随后就是on_attack的具体实现了，首先创建子弹对象，随后计算其偏移位置，设定子弹的速度，最后进行标记与回调设置并存入子弹即可。而特殊攻击方法首先设置状态与文本可见，随后由于我们希望其额外攻击位置生成于对方头顶的屏幕外并缓慢落下，所以需要在文件头部声明引入玩家指针。

```
//顶部引入所需图集
#include "gamer2Bullet.h"
#include "gamer2BulletEx.h"

extern Atlas atlas_gamer2_attack_ex_left;
extern Atlas atlas_gamer2_attack_ex_right;
extern Atlas atlas_gamer2_bullet_text;

extern Player* player_1;
extern Player* player_2;

//成员变量添加
const float speed_bullet_ex = 0.15f;
const Vector2 velocity_bullet = { 0.25f, -0.05f };

bool is_bullet_ex_visible = false;//设置是否现实特殊攻击子弹顶部文本

Animation m_animation_bullet_text;

//构造初始化代码添加
this->m_animation_attack_ex_left.setAtlas(&atlas_gamer2_attack_ex_left);
this->m_animation_attack_ex_right.setAtlas(&atlas_gamer2_attack_ex_right);
this->m_animation_bullet_text.setAtlas(&atlas_gamer2_bullet_text);

this->m_animation_attack_ex_left.setInterval(100);
this->m_animation_attack_ex_right.setInterval(100);
this->m_animation_bullet_text.setInterval(100);

this->m_animation_attack_ex_left.setLoop(false);
this->m_animation_attack_ex_right.setLoop(false);
this->m_animation_bullet_text.setLoop(false);

this->m_animation_attack_ex_left.setCallBack([&]() { this->is_bullet_ex_visible = this->is_attacking_ex = false; });
this->m_animation_attack_ex_right.setCallBack([&]() { this->is_bullet_ex_visible = this->is_attacking_ex = false; });

this->m_attack_cd = 250;

//更新on_update方法
virtual void on_update(int delta)
{
	Player::on_update(delta);

	if (this->is_bullet_ex_visible) this->m_animation_bullet_text.on_update(delta);
}

//重写on_draw绘图方法
virtual void on_draw(const Camera& camera)
{
	Player::on_draw(camera);

	if (this->is_bullet_ex_visible)
	{
		Vector2 text_position;
		IMAGE* frame = this->m_animation_bullet_text.getFrame();

		text_position.m_x = this->m_position.m_x - (this->m_size.m_x - frame->getwidth()) / 2;
		text_position.m_y = this->m_position.m_y - frame->getheight();

		this->m_animation_bullet_text.on_draw(camera, (int)text_position.m_x, (int)text_position.m_y);
	}
}

//on_attack方法重写
void on_attack()
{
	Bullet* bullet = new Gamer2Bullet();

	Vector2 bullet_positon;
	const Vector2& bullet_size = bullet->getSize();
	bullet_positon.m_x = this->m_position.m_x + (this->m_size.m_x - bullet_size.m_x) / 2;
	bullet_positon.m_y = this->m_position.m_y;

	bullet->setPosition(bullet_positon.m_x, bullet_positon.m_y);
	bullet->setVelocity(is_facing_right ? this->velocity_bullet.m_x : -this->velocity_bullet.m_x, this->velocity_bullet.m_y);

	bullet->setCollideTarget(this->m_id == PlayerId::P1 ? PlayerId::P2 : PlayerId::P1);
	bullet->setCallback([&]() { this->m_mp += 35; });

	bullet_list.push_back(bullet);
}

```



此处另起一块说明接下来出现问题了，因为需要生成位置基于玩家，所以玩家中需要有相关的get方法，所以来到player.h中，添加getSize方法返回玩家大小，getPosition获取玩家坐标。

```
//新增方法
const Vector2& getPosition() const { return this->m_position; }

const Vector2& getSize() const { return this->m_size; }

```



这样就可以开始着手完成角色2特殊攻击on_attack_ex函数重写了，继续之前从开始修改标记，接下来就是对文本动画重置并根据面朝方向重置对应方向特殊攻击，随后创建对应子弹类，找到需要攻击的对象，计算子弹位置并设置子弹坐标与速度，设置攻击对象随后设置回调并存入子弹，最后别忘了音效播放，至此子弹的大部分内容已经完成编写，下一节将继续以完成完整内容。

```
//完成特殊攻击重写
void on_attack_ex()
{
	this->is_attacking_ex = true;
	this->is_bullet_ex_visible = true;

	this->m_animation_bullet_text.reset();
	this->is_facing_right ? this->m_animation_attack_ex_right.reset() : this->m_animation_attack_ex_right.reset();

	Bullet* bullet = new Gamer2BulletEx();
	Player* target = (this->m_id == PlayerId::P1 ? player_2 : player_1);

	Vector2 bullet_position, bullet_velocity;
	const Vector2& bullet_size = bullet->getSize();
	const Vector2& target_size = target->getSize();
	const Vector2& target_position = target->getPosition();

	bullet_position.m_x = target_position.m_x + (target_size.m_x - bullet_size.m_x) / 2;
	bullet_position.m_y = -this->m_size.m_y;
	bullet_velocity.m_x = 0;
	bullet_velocity.m_y = this->speed_bullet_ex;

	bullet->setPosition(bullet_position.m_x, bullet_position.m_y);
	bullet->setVelocity(bullet_velocity.m_x, bullet_velocity.m_y);

	bullet->setCollideTarget(this->m_id == PlayerId::P1 ? PlayerId::P2 : PlayerId::P1);

	bullet->setCallback([&]() {this->m_mp += 30; });

	bullet_list.push_back(bullet);
	mciSendString(L"play gamer2_bullet_text from 0", NULL, 0, NULL);
}

```



## 第十三节完整代码

**player.h**

```
#ifndef _PLAYER_H_
#define _PLAYER_H_

#include "camera.h"
#include "vector2.h"
#include "animation.h"
#include "playerId.h"
#include "platform.h"
#include "bullet.h"

#include <graphics.h>

extern std::vector<Platform> platform_list;
extern std::vector<Bullet*> bullet_list;

class Player
{
public:
	Player()
	{
		this->m_current_animaiton = &this->m_animation_idle_right;

		this->m_timer_attack_cd.setWaitTime(this->m_attack_cd);
		this->m_timer_attack_cd.setOneShot(true);
		this->m_timer_attack_cd.setCallback([&]() {this->can_attack = true; });
	}

	~Player() = default;

	virtual void on_update(int delta)
	{
		if (this->is_attack_keydown)
		{
			if (this->can_attack)
			{
				this->on_attack();
				this->can_attack = false;
				this->m_timer_attack_cd.restart();
			}
		}

		int direction = this->is_right_keydown - this->is_left_keydown;

		if (direction != 0)
		{
			this->is_facing_right = direction > 0;
			this->m_current_animaiton = is_facing_right ? &this->m_animation_run_right : &this->m_animation_run_left;
			
			float distance = direction * this->run_velocity * delta;
			this->on_run(distance);

		}
		else
		{
			this->m_current_animaiton = is_facing_right ? &this->m_animation_idle_right : &this->m_animation_idle_left;
		}

		this->m_current_animaiton->on_update(delta);
		this->m_timer_attack_cd.on_updata(delta);
		this->moveAndCollide(delta);
	}

	virtual void on_draw(const Camera& camera)
	{
		this->m_current_animaiton->on_draw(camera, this->m_position.m_x, this->m_position.m_y);
	}

	virtual void on_input(const ExMessage& msg)
	{
		switch (msg.message)
		{
		case WM_KEYDOWN:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = true;
					break;
				case 0x44://'D'
					this->is_right_keydown = true;
					break;
				case 0x57://'W'
					this->on_jump();
					break;
				case 0x46://'F'
					this->is_attack_keydown = true;
					break;
				case 0x47://'G'
					if (this->m_mp >= 100) this->m_mp = 0, this->on_attack_ex();
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = true;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = true;
					break;
				case VK_UP://'↑'
					this->on_jump();
					break;
				case VK_OEM_PERIOD://'.'
					this->is_attack_keydown = true;
					break;
				case VK_OEM_COMMA://','
					if (this->m_mp >= 100) this->m_mp = 0, this->on_attack_ex();
					break;
				}
				break;
			}
			break;
		case WM_KEYUP:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = false;
					break;
				case 0x44://'D'
					this->is_right_keydown = false;
					break;
				case 0x46://'F'
					this->is_attack_keydown = false;
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = false;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = false;
					break;
				case VK_OEM_PERIOD://'.'
					this->is_attack_keydown = false;
					break;
				}
				break;
			}
			break;
		}

	}

	void on_jump()
	{
		if (this->m_velocity.m_y != 0 || this->is_attacking_ex) return;

		this->m_velocity.m_y += this->jump_velocity;
	}

	void on_run(float destance) 
	{
		if (this->is_attacking_ex) return;

		this->m_position.m_x += destance;
	}

	void moveAndCollide(int delta)
	{
		this->m_velocity.m_y += this->gravity * delta;
		this->m_position += this->m_velocity * (float)delta;

		if (this->m_velocity.m_y > 0)
		{
			for (const Platform& pt : platform_list)
			{
				const Platform::CollisionShape& shape = pt.m_shape;

				bool is_collide_x = (max(this->m_position.m_x + this->m_size.m_x, shape.right) - min(this->m_position.m_x, shape.left) <= this->m_size.m_x + (shape.right - shape.left));
				bool is_collide_y = (shape.y >= this->m_position.m_y && shape.y <= this->m_position.m_y + this->m_size.m_y);

				if (is_collide_x && is_collide_y)
				{
					float delta_pos_y = this->m_velocity.m_y * delta;
					float last_tick_foot_pos_y = this->m_position.m_y + this->m_size.m_y - delta_pos_y;
					if (last_tick_foot_pos_y <= shape.y)
					{
						this->m_position.m_y = shape.y - this->m_size.m_y;
						this->m_velocity.m_y = 0;

						break;
					}
				}
			}
		}
	}

	void setId(PlayerId id) { this->m_id = id; }

	void setPosition(int x, int y) { this->m_position.m_x = x, this->m_position.m_y = y; }

	const Vector2& getPosition() const { return this->m_position; }

	const Vector2& getSize() const { return this->m_size; }

	virtual void on_attack() {}

	virtual void on_attack_ex() {}

protected:
	int m_hp = 100;
	int m_mp = 0;

	Vector2 m_size;
	Vector2 m_position;
	Vector2 m_velocity;

	Animation m_animation_idle_left;
	Animation m_animation_idle_right;
	Animation m_animation_run_left;
	Animation m_animation_run_right;
	Animation m_animation_attack_ex_left;
	Animation m_animation_attack_ex_right;

	Animation* m_current_animaiton = nullptr;

	PlayerId m_id;

	const float run_velocity = 0.55f;//水平移动速度
	const float gravity = 0.0016f;//重力加速度
	const float jump_velocity = -0.85f;//跳跃速度

	bool is_left_keydown = false;
	bool is_right_keydown = false;

	bool is_facing_right = true;

	bool is_attack_keydown = false;
	bool is_attacking_ex = false;

	bool can_attack = true;
	int m_attack_cd = 500;
	Timer m_timer_attack_cd;

};

#endif
```

**playerGamer1.h**

```
#ifndef _PLAYERGAMER1_H_
#define _PLAYERGAMER1_H_

#include "player.h"
#include "gamer1Bullet.h"

extern Atlas atlas_gamer1_idle_left;
extern Atlas atlas_gamer1_idle_right;
extern Atlas atlas_gamer1_run_left;
extern Atlas atlas_gamer1_run_right;
extern Atlas atlas_gamer1_attack_ex_left;
extern Atlas atlas_gamer1_attack_ex_right;

class PlayerGamer1 : public Player
{
public:
	PlayerGamer1()
	{
		this->m_animation_idle_left.setAtlas(&atlas_gamer1_idle_left);
		this->m_animation_idle_right.setAtlas(&atlas_gamer1_idle_right);
		this->m_animation_run_left.setAtlas(&atlas_gamer1_run_left);
		this->m_animation_run_right.setAtlas(&atlas_gamer1_run_right);
		this->m_animation_attack_ex_left.setAtlas(&atlas_gamer1_attack_ex_left);
		this->m_animation_attack_ex_right.setAtlas(&atlas_gamer1_attack_ex_right);

		this->m_animation_idle_left.setInterval(75);
		this->m_animation_idle_right.setInterval(75);
		this->m_animation_run_left.setInterval(75);
		this->m_animation_run_right.setInterval(75);
		this->m_animation_attack_ex_left.setInterval(75);
		this->m_animation_attack_ex_right.setInterval(75);

		this->m_size.m_x = 96;
		this->m_size.m_y = 96;

		this->m_timer_attack_ex.setWaitTime(this->attack_ex_duration);
		this->m_timer_attack_ex.setOneShot(true);
		this->m_timer_attack_ex.setCallback([&]() {this->is_attacking_ex = false; });

		this->m_timer_spawn_bullet_ex.setWaitTime(100);
		this->m_timer_spawn_bullet_ex.setOneShot(false);
		this->m_timer_spawn_bullet_ex.setCallback([&]() {this->spawnBullet1(this->speed_bullet_ex); });

		this->m_attack_cd = 100;
	}

	~PlayerGamer1() = default;

	virtual void on_update(int delta)
	{
		Player::on_update(delta);

		if (this->is_attacking_ex)
		{
			main_camera.shake(5, 100);
			this->m_timer_attack_ex.on_updata(delta);
			this->m_timer_spawn_bullet_ex.on_updata(delta);
		}
	}

	void spawnBullet1(float speed)
	{
		Bullet* bullet = new Gamer1Bullet();

		Vector2 bullet_position, bullet_velocity;
		const Vector2& bullet_size = bullet->getSize();

		bullet_position.m_x = this->is_facing_right ? this->m_position.m_x + this->m_size.m_x - bullet_size.m_x / 2 : this->m_position.m_x - bullet_size.m_x / 2;
		bullet_position.m_y = this->m_position.m_y;

		bullet_velocity.m_x = this->is_facing_right ? speed : -speed;
		bullet_velocity.m_y = 0;

		bullet->setPosition(bullet_position.m_x, bullet_position.m_y);
		bullet->setVelocity(bullet_velocity.m_x, bullet_velocity.m_y);

		bullet->setCollideTarget(this->m_id == PlayerId::P1 ? PlayerId::P2 : PlayerId::P1);
		bullet->setCallback([&]() {this->m_mp += 25; });

		bullet_list.push_back(bullet);
	}

	void on_attack()
	{
		this->spawnBullet1(this->speed_bullet);

		switch (rand() % 2)
		{
		case 0:
			mciSendString(L"play gamer1_bullet_shoot_1 from 0", NULL, 0, NULL);
			break;
		case 1:
			mciSendString(L"play gamer1_bullet_shoot_2 from 0", NULL, 0, NULL);
			break;
		}
	}

	void on_attack_ex()
	{
		this->is_attacking_ex = true;
		this->m_timer_attack_ex.restart();

		mciSendString(L"play gamer1_bullet_shoot_ex from 500", NULL, 0, NULL);

		this->is_facing_right ? this->m_animation_attack_ex_right.reset() : this->m_animation_attack_ex_left.reset();
	}

private:
	const float speed_bullet = 0.75f;
	const float speed_bullet_ex = 1.5f;
	const int attack_ex_duration = 2500;

	Timer m_timer_attack_ex;
	Timer m_timer_spawn_bullet_ex;

};

#endif // !_PLAYERGAMER1_H_

```

**playerGamer2.h**

```
#ifndef _PLAYERGAMER2_H_
#define _PLAYERGAMER2_H_

#include "player.h"
#include "gamer2Bullet.h"
#include "gamer2BulletEx.h"

extern Atlas atlas_gamer2_idle_left;
extern Atlas atlas_gamer2_idle_right;
extern Atlas atlas_gamer2_run_left;
extern Atlas atlas_gamer2_run_right;
extern Atlas atlas_gamer2_attack_ex_left;
extern Atlas atlas_gamer2_attack_ex_right;
extern Atlas atlas_gamer2_bullet_text;

extern Player* player_1;
extern Player* player_2;

class PlayerGamer2 : public Player
{
public:
	PlayerGamer2()
	{
		this->m_animation_idle_left.setAtlas(&atlas_gamer2_idle_left);
		this->m_animation_idle_right.setAtlas(&atlas_gamer2_idle_right);
		this->m_animation_run_left.setAtlas(&atlas_gamer2_run_left);
		this->m_animation_run_right.setAtlas(&atlas_gamer2_run_right);
		this->m_animation_attack_ex_left.setAtlas(&atlas_gamer2_attack_ex_left);
		this->m_animation_attack_ex_right.setAtlas(&atlas_gamer2_attack_ex_right);
		this->m_animation_bullet_text.setAtlas(&atlas_gamer2_bullet_text);

		this->m_animation_idle_left.setInterval(75);
		this->m_animation_idle_right.setInterval(75);
		this->m_animation_run_left.setInterval(75);
		this->m_animation_run_right.setInterval(75);
		this->m_animation_attack_ex_left.setInterval(100);
		this->m_animation_attack_ex_right.setInterval(100);
		this->m_animation_bullet_text.setInterval(100);

		this->m_animation_attack_ex_left.setLoop(false);
		this->m_animation_attack_ex_right.setLoop(false);
		this->m_animation_bullet_text.setLoop(false);

		this->m_animation_attack_ex_left.setCallBack([&]() { this->is_bullet_ex_visible = this->is_attacking_ex = false; });
		this->m_animation_attack_ex_right.setCallBack([&]() { this->is_bullet_ex_visible = this->is_attacking_ex = false; });

		this->m_size.m_x = 96;
		this->m_size.m_y = 96;

		this->m_attack_cd = 250;
	}

	~PlayerGamer2() = default;

	virtual void on_update(int delta)
	{
		Player::on_update(delta);

		if (this->is_bullet_ex_visible) this->m_animation_bullet_text.on_update(delta);
	}
	
	virtual void on_draw(const Camera& camera)
	{
		Player::on_draw(camera);

		if (this->is_bullet_ex_visible)
		{
			Vector2 text_position;
			IMAGE* frame = this->m_animation_bullet_text.getFrame();

			text_position.m_x = this->m_position.m_x - (this->m_size.m_x - frame->getwidth()) / 2;
			text_position.m_y = this->m_position.m_y - frame->getheight();

			this->m_animation_bullet_text.on_draw(camera, (int)text_position.m_x, (int)text_position.m_y);
		}
	}

	void on_attack()
	{
		Bullet* bullet = new Gamer2Bullet();

		Vector2 bullet_positon;
		const Vector2& bullet_size = bullet->getSize();
		bullet_positon.m_x = this->m_position.m_x + (this->m_size.m_x - bullet_size.m_x) / 2;
		bullet_positon.m_y = this->m_position.m_y;

		bullet->setPosition(bullet_positon.m_x, bullet_positon.m_y);
		bullet->setVelocity(is_facing_right ? this->velocity_bullet.m_x : -this->velocity_bullet.m_x, this->velocity_bullet.m_y);

		bullet->setCollideTarget(this->m_id == PlayerId::P1 ? PlayerId::P2 : PlayerId::P1);
		bullet->setCallback([&]() { this->m_mp += 35; });

		bullet_list.push_back(bullet);
	}

	void on_attack_ex()
	{
		this->is_attacking_ex = true;
		this->is_bullet_ex_visible = true;

		this->m_animation_bullet_text.reset();
		this->is_facing_right ? this->m_animation_attack_ex_right.reset() : this->m_animation_attack_ex_right.reset();

		Bullet* bullet = new Gamer2BulletEx();
		Player* target = (this->m_id == PlayerId::P1 ? player_2 : player_1);

		Vector2 bullet_position, bullet_velocity;
		const Vector2& bullet_size = bullet->getSize();
		const Vector2& target_size = target->getSize();
		const Vector2& target_position = target->getPosition();

		bullet_position.m_x = target_position.m_x + (target_size.m_x - bullet_size.m_x) / 2;
		bullet_position.m_y = -this->m_size.m_y;
		bullet_velocity.m_x = 0;
		bullet_velocity.m_y = this->speed_bullet_ex;

		bullet->setPosition(bullet_position.m_x, bullet_position.m_y);
		bullet->setVelocity(bullet_velocity.m_x, bullet_velocity.m_y);

		bullet->setCollideTarget(this->m_id == PlayerId::P1 ? PlayerId::P2 : PlayerId::P1);

		bullet->setCallback([&]() {this->m_mp += 30; });

		bullet_list.push_back(bullet);
		mciSendString(L"play gamer2_bullet_text from 0", NULL, 0, NULL);
	}

private:
	const float speed_bullet_ex = 0.15f;
	const Vector2 velocity_bullet = { 0.25f, -0.5f };

	bool is_bullet_ex_visible = false;//设置是否现实特殊攻击子弹顶部文本

	Animation m_animation_bullet_text;

};

#endif // !_PLAYERGAMER2_H_
```

**main.cpp**

```
#include "atlas.h"
#include "camera.h"

#include "scene.h"
#include "sceneManager.h"
#include "menuScene.h"
#include "gameScene.h"
#include "selectorScene.h"

#include "utils.h"
#include "platform.h"
#include "bullet.h"

#include "player.h"
#include "playerGamer1.h"
#include "playerGamer2.h"

#pragma comment(lib, "Winmm.lib")

#include <graphics.h>
#include <vector>

const int FPS = 60;

bool is_debug = false;

Camera main_camera;

std::vector<Platform> platform_list;
std::vector<Bullet*> bullet_list;

Player* player_1 = nullptr;
Player* player_2 = nullptr;

IMAGE img_menu_background;					//主菜单背景图片

IMAGE img_VS;								//VS 艺术字图片
IMAGE img_1P;								//1P 文本图片
IMAGE img_2P;								//2P 文本图片
IMAGE img_1P_desc;							//1P 键位描述图片
IMAGE img_2P_desc;							//2P 键位描述图片
IMAGE img_select_background_left;			//选人朝左背景图片
IMAGE img_select_background_right;			//选人朝右背景图片
IMAGE img_selector_tip;						//选人界面提示信息
IMAGE img_selector_background;				//选人界面背景图
IMAGE img_1P_selector_btn_idle_left;		//1P 向左选择按钮默认状态图片
IMAGE img_1P_selector_btn_idle_right;		//1P 向右选择按钮默认状态图片
IMAGE img_1P_selector_btn_down_left;		//1P 向左选择按钮按下状态图片
IMAGE img_1P_selector_btn_down_right;		//1P 向右选择按钮按下状态图片
IMAGE img_2P_selector_btn_idle_left;		//2P 向左选择按钮默认状态图片
IMAGE img_2P_selector_btn_idle_right;		//2P 向右选择按钮默认状态图片
IMAGE img_2P_selector_btn_down_left;		//2P 向左选择按钮按下状态图片
IMAGE img_2P_selector_btn_down_right;		//2P 向右选择按钮按下状态图片
IMAGE img_gamer1_selector_background_left;	//选人界面类型1朝左背景图片
IMAGE img_gamer1_selector_background_right;	//选人界面类型1朝右背景图片
IMAGE img_gamer2_selector_background_left;	//选人界面类型2朝左背景图片
IMAGE img_gamer2_selector_background_right;	//选人界面类型2朝右背景图片

IMAGE img_sky;								//填空图片
IMAGE img_hills;							//山脉图片
IMAGE img_platform_large;					//大型平台图片
IMAGE img_platform_small;					//小型平台图片

IMAGE img_1P_cursor;						//1P 指示光标图片
IMAGE img_2P_cursor;						//2P 指示光标图片

Atlas atlas_gamer1_idle_left;				//类型1向左默认动画图集
Atlas atlas_gamer1_idle_right;				//类型1向右默认动画图集
Atlas atlas_gamer1_run_left;				//类型1向左奔跑动画图集
Atlas atlas_gamer1_run_right;				//类型1向右奔跑动画图集
Atlas atlas_gamer1_attack_ex_left;			//类型1向左特殊攻击动画图集
Atlas atlas_gamer1_attack_ex_right;			//类型1向右特殊攻击动画图集
Atlas atlas_gamer1_die_left;				//类型1向左死亡动画图集
Atlas atlas_gamer1_die_right;				//类型1向右死亡动画图集

Atlas atlas_gamer2_idle_left;				//类型2向左默认动画图集
Atlas atlas_gamer2_idle_right;				//类型2向右默认动画图集
Atlas atlas_gamer2_run_left;				//类型2向左奔跑动画图集
Atlas atlas_gamer2_run_right;				//类型2向右奔跑动画图集
Atlas atlas_gamer2_attack_ex_left;			//类型2向左特殊攻击动画图集
Atlas atlas_gamer2_attack_ex_right;			//类型2向右特殊攻击动画图集
Atlas atlas_gamer2_die_left;				//类型2向左死亡动画图集
Atlas atlas_gamer2_die_right;				//类型2向右死亡动画图集

IMAGE img_gamer1_bullet;					//类型1子弹图片
Atlas atlas_gamer1_bullet_break;			//类型1子弹破碎动画图集
Atlas atlas_gemer2_bullet;					//类型2子弹动画图集
Atlas atlas_gemer2_bullet_explode;			//类型2子弹爆炸动画图集
Atlas atlas_gamer2_bullet_ex;				//类型2特殊类型子弹动画图集
Atlas atlas_gamer2_bullet_ex_explode;		//类型2特殊类型子弹爆炸动画图集
Atlas atlas_gamer2_bullet_text;				//类型2特殊类型子弹爆炸文本动画图集

Atlas atlas_run_effect;						//奔跑特效动画图集
Atlas atlas_jump_effect;					//跳跃特效动画图集
Atlas atlas_land_effect;					//落地特效动画图集

IMAGE img_winner_bar;						//获胜玩家背景图片
IMAGE img_1P_winner;						//1P 获胜文本图片
IMAGE img_2P_winner;						//2P 获胜文本图片

IMAGE img_avatar_gamer1;					//类型1头像图片
IMAGE img_avatar_gamer2;					//类型2头像图片

Scene* menu_scene = nullptr;
Scene* game_scene = nullptr;
Scene* selector_scene = nullptr;

SceneManager scene_manager;

void flipAtlas(Atlas& src, Atlas& dst)
{
	dst.clear();
	for (int i = 0; i < src.getSize(); i++)
	{
		IMAGE img_flpipped;
		flipImage(src.getImage(i), &img_flpipped);
		dst.addImage(img_flpipped);
	}
}

void loadGameResources()
{
	AddFontResourceEx(L"./resources/HYPixel11pxU-2.ttf", FR_PRIVATE, NULL);

	loadimage(&img_menu_background, L"./resources/menu_background.png");

	loadimage(&img_VS, L"./resources/VS.png");
	loadimage(&img_1P, L"./resources/1P.png");
	loadimage(&img_2P, L"./resources/2P.png");
	loadimage(&img_1P_desc, L"./resources/1P_desc.png");
	loadimage(&img_2P_desc, L"./resources/2P_desc.png");
	loadimage(&img_select_background_right, L"./resources/select_background.png");
	flipImage(&img_select_background_right, &img_select_background_left);
	loadimage(&img_selector_tip, L"./resources/selector_tip.png");
	loadimage(&img_selector_background, L"./resources/selector_background.png");
	loadimage(&img_1P_selector_btn_idle_right, L"./resources/1P_selector_btn_idle.png");
	flipImage(&img_1P_selector_btn_idle_right, &img_1P_selector_btn_idle_left);
	loadimage(&img_1P_selector_btn_down_right, L"./resources/1P_selector_btn_down.png");
	flipImage(&img_1P_selector_btn_down_right, &img_1P_selector_btn_down_left);
	loadimage(&img_2P_selector_btn_idle_right, L"./resources/2P_selector_btn_idle.png");
	flipImage(&img_2P_selector_btn_idle_right, &img_2P_selector_btn_idle_left);
	loadimage(&img_2P_selector_btn_down_right, L"./resources/2P_selector_btn_down.png");
	flipImage(&img_2P_selector_btn_down_right, &img_2P_selector_btn_down_left);
	loadimage(&img_gamer1_selector_background_right, L"./resources/gamer1_selector_background.png");
	flipImage(&img_gamer1_selector_background_right, &img_gamer1_selector_background_left);
	loadimage(&img_gamer2_selector_background_right, L"./resources/gamer2_selector_background.png");
	flipImage(&img_gamer2_selector_background_right, &img_gamer2_selector_background_left);

	loadimage(&img_sky, L"./resources/sky.png");
	loadimage(&img_hills, L"./resources/hills.png");
	loadimage(&img_platform_large, L"./resources/platform_large.png");
	loadimage(&img_platform_small, L"./resources/platform_small.png");

	loadimage(&img_1P_cursor, L"./resources/1P_cursor.png");
	loadimage(&img_2P_cursor, L"./resources/2P_cursor.png");

	atlas_gamer1_idle_right.loadFromFile(L"./resources/gamer1_idle_%d.png", 9);
	flipAtlas(atlas_gamer1_idle_right, atlas_gamer1_idle_left);
	atlas_gamer1_run_right.loadFromFile(L"./resources/gamer1_run_%d.png", 5);
	flipAtlas(atlas_gamer1_run_right, atlas_gamer1_run_left);
	atlas_gamer1_attack_ex_right.loadFromFile(L"./resources/gamer1_attack_ex_%d.png", 3);
	flipAtlas(atlas_gamer1_attack_ex_right, atlas_gamer1_attack_ex_left);
	atlas_gamer1_die_right.loadFromFile(L"./resources/gamer1_die_%d.png", 4);
	flipAtlas(atlas_gamer1_die_right, atlas_gamer1_die_left);

	atlas_gamer2_idle_right.loadFromFile(L"./resources/gamer2_idle_%d.png", 8);
	flipAtlas(atlas_gamer2_idle_right, atlas_gamer2_idle_left);
	atlas_gamer2_run_right.loadFromFile(L"./resources/gamer2_run_%d.png", 5);
	flipAtlas(atlas_gamer2_run_right, atlas_gamer2_run_left);
	atlas_gamer2_attack_ex_right.loadFromFile(L"./resources/gamer2_attack_ex_%d.png", 9);
	flipAtlas(atlas_gamer2_attack_ex_right, atlas_gamer2_attack_ex_left);
	atlas_gamer2_die_right.loadFromFile(L"./resources/gamer2_die_%d.png", 2);
	flipAtlas(atlas_gamer2_die_right, atlas_gamer2_die_left);

	loadimage(&img_gamer1_bullet, L"./resources/gamer1_bullet.png");
	atlas_gamer1_bullet_break.loadFromFile(L"./resources/gamer1_bullet_break_%d.png", 3);
	atlas_gemer2_bullet.loadFromFile(L"./resources/gamer2_bullet_%d.png", 5);
	atlas_gemer2_bullet_explode.loadFromFile(L"./resources/gamer2_bullet_explode_%d.png", 5);
	atlas_gamer2_bullet_ex.loadFromFile(L"./resources/gamer2_bullet_ex_%d.png", 5);
	atlas_gamer2_bullet_ex_explode.loadFromFile(L"./resources/gamer2_bullet_ex_explode_%d.png", 5);
	atlas_gamer2_bullet_text.loadFromFile(L"./resources/gamer2_bullet_text_%d.png", 6);

	atlas_run_effect.loadFromFile(L"./resources/run_effect_%d.png", 4);
	atlas_jump_effect.loadFromFile(L"./resources/jump_effect_%d.png", 5);
	atlas_land_effect.loadFromFile(L"./resources/land_effect_%d.png", 2);

	loadimage(&img_1P_winner, L"./resources/1P_winner.png");
	loadimage(&img_2P_winner, L"./resources/2P_winner.png");
	loadimage(&img_winner_bar, L"./resources/winner_bar.png");

	loadimage(&img_avatar_gamer1, L"./resources/avatar_gamer1.png");
	loadimage(&img_avatar_gamer2, L"./resources/avatar_gamer2.png");

	mciSendString(L"open ./resources/bgm_game.mp3 alias bgm_game", NULL, 0, NULL);
	mciSendString(L"open ./resources/bgm_menu.mp3 alias bgm_menu", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_1.mp3 alias gamer1_bullet_break_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_2.mp3 alias gamer1_bullet_break_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_break_3.mp3 alias gamer1_bullet_break_3", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_1.mp3 alias gamer1_bullet_shoot_1", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_2.mp3 alias gamer1_bullet_shoot_2", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer1_bullet_shoot_ex.mp3 alias gamer1_bullet_shoot_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode.mp3 alias gamer2_bullet_explode", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_explode_ex.mp3 alias gamer2_bullet_explode_ex", NULL, 0, NULL);
	mciSendString(L"open ./resources/gamer2_bullet_text.mp3 alias gamer2_bullet_text", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_confirm.wav alias ui_confirm", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_switch.wav alias ui_switch", NULL, 0, NULL);
	mciSendString(L"open ./resources/ui_win.wav alias ui_win", NULL, 0, NULL);

	return;
}

int main()
{
	ExMessage msg;

	loadGameResources();
	
	initgraph(1200, 720);

	menu_scene = new MenuScene();
	game_scene = new GameScene();
	selector_scene = new SelectorScene();

	scene_manager.setCurrentState(menu_scene);

	settextstyle(28, 0, L"HYPixel11pxU-2.ttf");
	setbkmode(TRANSPARENT);

	BeginBatchDraw();
	while (true)
	{
		DWORD frame_start_time = GetTickCount();

		while (peekmessage(&msg))
		{
			scene_manager.on_input(msg);
		}

		static DWORD last_tick_time = GetTickCount();
		DWORD current_tick_time = GetTickCount();
		DWORD delta_tick_time = current_tick_time - last_tick_time;
		scene_manager.on_updata(delta_tick_time);
		last_tick_time = current_tick_time;

		cleardevice();
		scene_manager.on_draw(main_camera);

		FlushBatchDraw();

		DWORD frame_end_time = GetTickCount();
		DWORD frame_delta_time = frame_end_time - frame_start_time;
		if (frame_delta_time < 1000 / FPS)
		{
			Sleep(1000 / FPS - frame_delta_time);
		}

	}
	EndBatchDraw();

	return 0;
}
```



## 第十四节

### 子弹发射更新与渲染补全

上一节完成了玩家层逻辑部分，所以接下来就需要从场景层调用之前编写好的方法了，首先来到GameScene.h中引入资源并编写on_update与on_draw方法，将摄像机更新以及子弹进行渲染更新，同时我们希望当角色处于特殊攻击时不允许水平转向，所以为is_faceing_right变量赋值之前先判断是否处于特殊攻击，随后在当前特殊攻击状态切换玩家当前动画，绘制方面注意顺序我们一般将子弹绘制在玩家上方，所以应该先绘制角色再绘制子弹，运行测试能够正确生成子弹与渲染更新。

```
//全局引用资源
extern std::vector<Bullet*> bullet_list;

//on_update增加转向禁止代码
if (!this->is_attacking_ex) this->is_facing_right = direction > 0;

//on_update增加子弹与动画更新代码
for (Bullet* b: bullet_list) b->on_update(delta);
main_camera.update(delta);

if (this->is_attacking_ex) this->m_current_animaiton = this->is_facing_right ? &this->m_animation_attack_ex_right : &this->m_animation_attack_ex_left;

//on_draw添加代码
for (const Bullet* b: bullet_list) b->on_draw(camera);

```



接下来添加子弹与玩家碰撞逻辑，在player.h中moveAndCollide玩家与场景中平台物理碰撞完成后遍历场景子弹对象是否可以与玩家发生碰撞以及碰撞目标是否与当前玩家匹配，不是则直接跳过，随后通过定义好的方法传入玩家位置与尺寸，若发生碰撞则调用子弹碰撞并修改子弹存活减少玩家生命即可。

来到gameScene.h中添加在on_update中的子弹删除逻辑，使用vector提供的erase方法配合remove_if函数以遍历每个子弹，在判断的lambda中检查是否可被删除，随后释放可被删除的内存返回是否可被删除的值来让更上层决定是否删除指针本身

```
//player.h成员函数moveAndCollide添加子弹碰撞检测
for (Bullet* b : bullet_list)
{
	if (!b->getValid() || b->getCollideTarget() != this->m_id) continue;
	
	if (b->checkCollide(this->m_position, this->m_size))
	{
		b->on_collide();
		b->setValid(false);

		this->m_hp -= b->getDamage();
	}
}

//gameScene.h成员函数on_update添加子弹移除
bullet_list.erase(std::remove_if(bullet_list.begin(), bullet_list.end(), 
	[](const Bullet* b)
	{
		bool deletable = b->checkCanRemove();
		if (deletable) delete b;
		return deletable;
	}), 
	bullet_list.end());

```



### 玩家受击短暂无敌帧

来到player.h中定义两个变量is_invulnerable与is_show_sketch_frame标识角色角色是否处于无敌以及当前帧是否应该显示剪影，再添加两个定时器m_timer_invulnerable与m_timer_invulnerable_blink表示无敌状态定时与闪烁定时，这样就只要在构造函数中设定计时器无敌时间750毫秒，剪影75毫秒切换一次即可，继续on_update中增加两定时器更新。

```
//成员变量增加
bool is_invulnerable = false;
bool is_show_sketch_frame = false;
Timer m_timer_invulnerable;
Timer m_timer_invulnerable_blink;

//构造函数设定定时器
this->m_timer_invulnerable.setWaitTime(750);
this->m_timer_invulnerable.setOneShot(true);
this->m_timer_invulnerable.setCallback([&]() { this->is_invulnerable = false; });

this->m_timer_invulnerable_blink.setWaitTime(75);
this->m_timer_invulnerable_blink.setCallback([&]() {this->is_show_sketch_frame = !this->is_show_sketch_frame; });

//on_update更新定时器
this->m_timer_invulnerable.on_updata(delta);
this->m_timer_invulnerable_blink.on_updata(delta);

```



由于我们需要纯白剪影，所以在utils.h中，新增sketchImage函数，将图片处理纯白剪影效果工具函数完成。

```
//新增工具函数
inline void sketchImage(IMAGE* src, IMAGE* dst)
{
	int w = src->getwidth();
	int h = src->getheight();

	Resize(dst, w, h);
	DWORD* src_buffer = GetImageBuffer(src);
	DWORD* dst_buffer = GetImageBuffer(dst);
	for (int y = 0; y < h; y++)
	{
		for (int x = 0; x < w; x++) 
		{
			int idx = y * w + x;
			dst_buffer[idx] = BGR(RGB(255, 255, 255) | (src_buffer[idx] & 0xFF000000));
		}
	}
}
```



回到player.h中存储角色剪影声明定义一个IMAGE类型img_sketch变量，随后在on_update只需判断当前帧会否需要剪影效果，若需要则处理剪影效果保存到定义的变量中，随后on_draw中根据情况绘制即可

```
//添加成员变量
IMAGE img_sketch;

//on_update添加代码
if (this->is_show_sketch_frame) sketchImage(this->m_current_animaiton->getFrame(), &this->m_img_sketch);

//on_draw添加代码
if (this->m_hp > 0 && this->is_invulnerable && this->is_show_sketch_frame) putImageAlpha(camera, (int)this->m_position.m_x, (int)this->m_position.m_y, &this->m_img_sketch);
else this->m_current_animaiton->on_draw(camera, this->m_position.m_x, this->m_position.m_y);

```



如此就可以开始完成无敌状态逻辑入口了，在Player类中编写进入无敌状态方法makeInvulnerable方法，内部逻辑首先设置无敌状态为true并重置定时器，并在碰撞后设置当前角色无敌状态，并且要注意其碰撞前提添加非无敌状态才会进行碰撞。

```
//添加函数
void makeInvulnerable()
{
	this->is_invulnerable = true;
	this->m_timer_invulnerable.restart();
}

//moveAndCollide碰撞前判断是否为无敌状态
if (!this->is_invulnerable)
{
	//原本子弹碰撞逻辑
}

//moveAndCollide碰撞后设置无敌状态
this->makeInvulnerable();

```



### 调试模式更多显示

可以仿照前面的平台绘制，给子弹与玩家添加相似的调试线框，来在运行时检查数据碰撞是否正常。

首先在player.h中引入is_debug变量，随后在debug开启时绘制时将玩家碰撞矩形绘制出来，虽然也可以仿照之前line函数提供使用摄像机位置进行绘图的重载，但是本项目中摄像头移动基本不明显可以简化使用默认rectangle函数进行绘制。

同样在bullet.h中也引入is_debug变量，在子弹on_draw方法中也添加绘制调试信息的代码，随后来到子类Gamer1Bullet.h，Gamer2Bullet.h与Gamer2BulletEx.h中在on_draw显示调用父类绘制方法，运行程序按下调试按键Q，可以看到可视化的碰撞信息。

```
//player.h头部引入变量
extern bool is_debug;

//player.h成员函数on_draw增加代码
if (is_debug)
{
	setlinecolor(RGB(0, 125, 255));
	rectangle((int)this->m_position.m_x, (int)this->m_position.m_y, (int)(this->m_position.m_x + this->m_size.m_x), (int)(this->m_position.m_y + this->m_size.m_y));
}

//bullet.h头部引入变量
extern bool is_debug;

//bullet.h中on_draw添加代码
if (is_debug)
{
	setfillcolor((RGB(255, 255, 255)));
	setlinecolor((RGB(255, 255, 255)));

	rectangle((int)this->m_position.m_x, (int)this->m_position.m_y, (int)this->m_position.m_x + this->m_size.m_x, (int)this->m_position.m_y + this->m_size.m_y);
	solidcircle((int)this->m_position.m_x + this->m_size.m_x / 2, (int)this->m_position.m_y + this->m_size.m_y / 2, 5);
}

//Gamer1Bullet.h中结束添加
Bullet::on_draw(camera);

//Gamer2Bullet.h中结束添加
Bullet::on_draw(camera);

//Gamer2BulletEx.h中结束添加
Bullet::on_draw(camera);

```



### 状态栏实现

状态栏的实现创建新的statusBar.h文件，创建StatusBar类并定义m_position成员变量存储状态条渲染位置，以及暂存需要显示的玩家消息m_hp与m_mp，最后是一个图片类型m_img_avatar指针用于存储角色头像，这样就可以提供一个setAvatar方法用于设置用户头像图片以及位置信息setPosition的函数，最后还有生命值与能量的设置方法setHp与setMp，最后提供一个on_draw方法，由于界面绘制不需要依赖摄像机位置渲染，所以可以不添加任何参数，on_draw内部首先渲染了头像图片随后对两个状态跳到渲染，这正部分中定义一个width常量用于描述宽度，接下来只需要使用不同绘图颜色绘制圆角矩形两次便可以实现带阴影效果的状态条底板了，随后就是根据当前生命值和能量值来计算状态条需要填充多长内容了，随后使用不同颜色填充能量条了。

```
#ifndef _STATUSBAR_H_
#define _STATUSBAR_H_

#include "utils.h"
#include "vector2.h"

class StatusBar 
{
public:
	StatusBar() = default;
	~StatusBar() = default;

	void setAvatar(IMAGE* img)
	{
		this->m_img_avatar = img;
	}

	void setPosition(int x, int y)
	{
		this->m_position.m_x = x, this->m_position.m_y = y;
	}

	void setHp(int val)
	{
		this->m_hp = val;
	}

	void setMp(int val)
	{
		this->m_mp = val;
	}
	
	void on_draw()
	{
		putImageAlpha(this->m_position.m_x, this->m_position.m_y, this->m_img_avatar);

		setfillcolor(RGB(5, 5, 5));
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 10, this->m_position.m_x + 100 + this->width + 3 * 2, this->m_position.m_y + 36, 8, 8);
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 45, this->m_position.m_x + 100 + this->width + 3 * 2, this->m_position.m_y + 71, 8, 8);

		setfillcolor(RGB(67, 47, 47));
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 10, this->m_position.m_x + 100 + this->width + 3, this->m_position.m_y + 33, 8, 8);
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 45, this->m_position.m_x + 100 + this->width + 3, this->m_position.m_y + 68, 8, 8);

		float hp_bar_width = this->width * max(0, this->m_hp) / 100.0f;
		float mp_bar_width = this->width * min(100, this->m_mp) / 100.0f;

		setfillcolor(RGB(197, 61, 67));
		msolidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 10, this->m_position.m_x + 100 + (int)hp_bar_width + 3, this->m_position.m_y + 33, 8, 8);
		setfillcolor(RGB(83, 131, 195));
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 45, this->m_position.m_x + 100 + (int)mp_bar_width + 3, this->m_position.m_y + 68, 8, 8);
	}

private:
	const int width = 275;

private:
	int m_hp = 0;
	int m_mp = 0;

	Vector2 m_position = { 0, 0 };

	IMAGE* m_img_avatar = nullptr;

};

#endif
```



随后只需要在gameScene.h头文件引入statusBar.h，并在类内添加两个状态条对象，随后在on_draw方法的末尾添加两个状态栏的渲染，由于需要获取玩家状态数值，需要给玩家添加mp与hp的get方法，随后在gameScene.h中的on_update依次调用set方法进行设置。

但是此处还是有一个问题，选角部分两个玩家具体使用哪张图片作为头像还未记录在程序中，所有首先在main.cpp中定义两个全局图片指针img_player_1_avatar与img_player_2_avatar，这样就可以在selectorScene.h中添加外部声明并在场景退出阶段实例化玩家后设置对应的头像，在gameScene.h中即可现在全局声明引用外部资源，随后在on_enter中设置状态框头像图片，运行后即可看到mp与hp实时显示反馈可视化图片了。

```
//gameScene.h顶部引入头文件gameScene.h
#include "statusBar.h"

//gameScene.h成员变量添加玩家状态条
StatusBar m_status_bar_1P;
StatusBar m_status_bar_2P;

//gameScene.h中on_draw方法最后进行渲染
this->m_status_bar_1P.on_draw();
this->m_status_bar_2P.on_draw();

//player.h中添加获取方法
const int getHp() const { return this->m_hp; }
const int getMp() const { return this->m_mp; }

//gameScene.h中on_update方法最后进行渲染
this->m_status_bar_1P.setHp(player_1->getHp());
this->m_status_bar_1P.setMp(player_1->getMp());
this->m_status_bar_2P.setHp(player_2->getHp());
this->m_status_bar_2P.setMp(player_2->getMp());

//main.cpp全局区添加变量
IMAGE* img_player_1_avatar = nullptr;
IMAGE* img_player_2_avatar = nullptr;

//selectorScene.h全局引入声明
extern IMAGE* img_player_1_avatar;
extern IMAGE* img_player_2_avatar;

//selectorScene.h成员函数中on_exit添加代码
virtual void on_exit()
{
	switch (this->m_player_type_1)
	{
	case PlayerType::Gamer1:
		player_1 = new PlayerGamer1();
		img_player_1_avatar = &img_avatar_gamer1;
		break;
	case PlayerType::Gamer2:
		player_1 = new PlayerGamer2();
		img_player_1_avatar = &img_avatar_gamer2;
		break;
	}
	player_1->setId(PlayerId::P1);

	switch (this->m_player_type_2)
	{
	case PlayerType::Gamer1:
		player_2 = new PlayerGamer1();
		img_player_2_avatar = &img_avatar_gamer1;
		break;
	case PlayerType::Gamer2:
		player_2 = new PlayerGamer2();
		img_player_2_avatar = &img_avatar_gamer2;
		break;
	}
	player_2->setId(PlayerId::P2);
}

//gameScene.h外部引用变量
extern IMAGE* img_player_1_avatar;
extern IMAGE* img_player_2_avatar;

//gameScene.h中on_enter方法添加代码
this->m_status_bar_1P.setAvatar(img_player_1_avatar);
this->m_status_bar_2P.setAvatar(img_player_2_avatar);

this->m_status_bar_1P.setPosition(235, 625);
this->m_status_bar_2P.setPosition(675, 625);

```



## 第十四节完整代码

**GameScene.h**

```
#ifndef _GAME_SCENE_H_
#define _GAME_SCENE_H_

#include "utils.h"
#include "platform.h"
#include "scene.h"
#include "sceneManager.h"
#include "player.h"
#include "statusBar.h"

extern Player* player_1;
extern Player* player_2;

extern IMAGE img_sky;
extern IMAGE img_hills;
extern IMAGE img_platform_large;
extern IMAGE img_platform_small;

extern IMAGE* img_player_1_avatar;
extern IMAGE* img_player_2_avatar;

extern Camera main_camera;

extern std::vector<Platform> platform_list;
extern std::vector<Bullet*> bullet_list;

extern SceneManager scene_manager;

class GameScene : public Scene
{
public:
	GameScene() = default;
	~GameScene() = default;

	virtual void on_enter()
	{
		this->m_status_bar_1P.setAvatar(img_player_1_avatar);
		this->m_status_bar_2P.setAvatar(img_player_2_avatar);

		this->m_status_bar_1P.setPosition(235, 625);
		this->m_status_bar_2P.setPosition(675, 625);

		player_1->setPosition(200, 50);
		player_2->setPosition(975, 50);

		this->pos_img_sky.x = (getwidth() - img_sky.getwidth()) / 2;
		this->pos_img_sky.y = (getheight() - img_sky.getheight()) / 2;

		this->pos_img_hills.x = (getwidth() - img_hills.getwidth()) / 2;
		this->pos_img_hills.y = (getheight() - img_hills.getheight()) / 2;

		platform_list.resize(4);
		Platform& large_platform = platform_list[0];
		large_platform.m_img = &img_platform_large;
		large_platform.m_render_position.x = 122;
		large_platform.m_render_position.y = 455;
		large_platform.m_shape.left = (float)large_platform.m_render_position.x + 30;
		large_platform.m_shape.right = (float)large_platform.m_render_position.x + img_platform_large.getwidth() - 30;
		large_platform.m_shape.y = (float)large_platform.m_render_position.y + 60;

		Platform& small_platform_1 = platform_list[1];
		small_platform_1.m_img = &img_platform_small;
		small_platform_1.m_render_position.x = 175;
		small_platform_1.m_render_position.y = 360;
		small_platform_1.m_shape.left = (float)small_platform_1.m_render_position.x + 40;
		small_platform_1.m_shape.right = (float)small_platform_1.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_1.m_shape.y = (float)small_platform_1.m_render_position.y + img_platform_small.getheight() / 2;

		Platform& small_platform_2 = platform_list[2];
		small_platform_2.m_img = &img_platform_small;
		small_platform_2.m_render_position.x = 855;
		small_platform_2.m_render_position.y = 360;
		small_platform_2.m_shape.left = (float)small_platform_2.m_render_position.x + 40;
		small_platform_2.m_shape.right = (float)small_platform_2.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_2.m_shape.y = (float)small_platform_2.m_render_position.y + img_platform_small.getheight() / 2;

		Platform& small_platform_3 = platform_list[3];
		small_platform_3.m_img = &img_platform_small;
		small_platform_3.m_render_position.x = 515;
		small_platform_3.m_render_position.y = 255;
		small_platform_3.m_shape.left = (float)small_platform_3.m_render_position.x + 40;
		small_platform_3.m_shape.right = (float)small_platform_3.m_render_position.x + img_platform_small.getwidth() - 40;
		small_platform_3.m_shape.y = (float)small_platform_3.m_render_position.y + img_platform_small.getheight() / 2;

	}

	virtual void on_update(int delta)
	{
		player_1->on_update(delta);
		player_2->on_update(delta);

		main_camera.on_updata(delta);

		bullet_list.erase(std::remove_if(bullet_list.begin(), bullet_list.end(), 
			[](const Bullet* b)
			{
				bool deletable = b->checkCanRemove();
				if (deletable) delete b;
				return deletable;
			}), 
			bullet_list.end());

		for (Bullet* b : bullet_list) b->on_update(delta);

		this->m_status_bar_1P.setHp(player_1->getHp());
		this->m_status_bar_1P.setMp(player_1->getMp());
		this->m_status_bar_2P.setHp(player_2->getHp());
		this->m_status_bar_2P.setMp(player_2->getMp());
	}

	virtual void on_draw(const Camera& camera) 
	{
		putImageAlpha(camera, this->pos_img_sky.x, this->pos_img_sky.y, &img_sky);
		putImageAlpha(camera, this->pos_img_hills.x, this->pos_img_hills.y, &img_hills);

		for (const Platform& p : platform_list) p.on_draw(camera);

		player_1->on_draw(camera);
		player_2->on_draw(camera);

		for (const Bullet* b : bullet_list) b->on_draw(camera);

		this->m_status_bar_1P.on_draw();
		this->m_status_bar_2P.on_draw();
	}

	virtual void on_input(const ExMessage& msg)
	{
		player_1->on_input(msg);
		player_2->on_input(msg);

		switch (msg.message)
		{
		case WM_KEYDOWN:
			break;
		case WM_KEYUP:
			switch (msg.vkcode)
			{
			case 0x51://'Q'
				is_debug = !is_debug;
				break;
			default:
				break;
			}
			break;
		default:
			break;
		}
	}

	virtual void on_exit() {}

private:
	POINT pos_img_sky = { 0 };
	POINT pos_img_hills = { 0 };

	StatusBar m_status_bar_1P;
	StatusBar m_status_bar_2P;

};

#endif
```

**player.h**

```
#ifndef _PLAYER_H_
#define _PLAYER_H_

#include "camera.h"
#include "vector2.h"
#include "animation.h"
#include "playerId.h"
#include "platform.h"
#include "bullet.h"

#include <graphics.h>

extern std::vector<Platform> platform_list;
extern std::vector<Bullet*> bullet_list;

extern bool is_debug;

class Player
{
public:
	Player()
	{
		this->m_current_animaiton = &this->m_animation_idle_right;

		this->m_timer_invulnerable.setWaitTime(750);
		this->m_timer_invulnerable.setOneShot(true);
		this->m_timer_invulnerable.setCallback([&]() { this->is_invulnerable = false; });

		this->m_timer_invulnerable_blink.setWaitTime(75);
		this->m_timer_invulnerable_blink.setCallback([&]() {this->is_show_sketch_frame = !this->is_show_sketch_frame; });

		this->m_timer_attack_cd.setWaitTime(this->m_attack_cd);
		this->m_timer_attack_cd.setOneShot(true);
		this->m_timer_attack_cd.setCallback([&]() {this->can_attack = true; });
	}

	~Player() = default;

	virtual void on_update(int delta)
	{
		if (this->is_attack_keydown)
		{
			if (this->can_attack)
			{
				this->on_attack();
				this->can_attack = false;
				this->m_timer_attack_cd.restart();
			}
		}

		int direction = this->is_right_keydown - this->is_left_keydown;

		if (direction != 0)
		{
			if (!this->is_attacking_ex) this->is_facing_right = direction > 0;

			this->m_current_animaiton = is_facing_right ? &this->m_animation_run_right : &this->m_animation_run_left;
			
			float distance = direction * this->run_velocity * delta;
			this->on_run(distance);
		}
		else
		{
			this->m_current_animaiton = is_facing_right ? &this->m_animation_idle_right : &this->m_animation_idle_left;
		}

		if (this->is_attacking_ex) this->m_current_animaiton = this->is_facing_right ? &this->m_animation_attack_ex_right : &this->m_animation_attack_ex_left;

		this->m_current_animaiton->on_update(delta);

		this->m_timer_attack_cd.on_updata(delta);
		this->m_timer_invulnerable.on_updata(delta);
		this->m_timer_invulnerable_blink.on_updata(delta);
		
		if (this->is_show_sketch_frame) sketchImage(this->m_current_animaiton->getFrame(), &this->m_img_sketch);

		this->moveAndCollide(delta);
	}

	virtual void on_draw(const Camera& camera)
	{
		if (this->m_hp > 0 && this->is_invulnerable && this->is_show_sketch_frame) putImageAlpha(camera, (int)this->m_position.m_x, (int)this->m_position.m_y, &this->m_img_sketch);
		else this->m_current_animaiton->on_draw(camera, this->m_position.m_x, this->m_position.m_y);

		if (is_debug)
		{
			setlinecolor(RGB(0, 125, 255));
			rectangle((int)this->m_position.m_x, (int)this->m_position.m_y, (int)(this->m_position.m_x + this->m_size.m_x), (int)(this->m_position.m_y + this->m_size.m_y));
		}
	}

	virtual void on_input(const ExMessage& msg)
	{
		switch (msg.message)
		{
		case WM_KEYDOWN:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = true;
					break;
				case 0x44://'D'
					this->is_right_keydown = true;
					break;
				case 0x57://'W'
					this->on_jump();
					break;
				case 0x46://'F'
					this->is_attack_keydown = true;
					break;
				case 0x47://'G'
					if (this->m_mp >= 100) this->m_mp = 0, this->on_attack_ex();
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = true;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = true;
					break;
				case VK_UP://'↑'
					this->on_jump();
					break;
				case VK_OEM_PERIOD://'.'
					this->is_attack_keydown = true;
					break;
				case VK_OEM_COMMA://','
					if (this->m_mp >= 100) this->m_mp = 0, this->on_attack_ex();
					break;
				}
				break;
			}
			break;
		case WM_KEYUP:
			switch (this->m_id)
			{
			case PlayerId::P1:
				switch (msg.vkcode)
				{
				case 0x41://'A'
					this->is_left_keydown = false;
					break;
				case 0x44://'D'
					this->is_right_keydown = false;
					break;
				case 0x46://'F'
					this->is_attack_keydown = false;
					break;
				}
				break;
			case PlayerId::P2:
				switch (msg.vkcode)
				{
				case VK_LEFT://'←'
					this->is_left_keydown = false;
					break;
				case VK_RIGHT://'→'
					this->is_right_keydown = false;
					break;
				case VK_OEM_PERIOD://'.'
					this->is_attack_keydown = false;
					break;
				}
				break;
			}
			break;
		}

	}

	void on_jump()
	{
		if (this->m_velocity.m_y != 0 || this->is_attacking_ex) return;

		this->m_velocity.m_y += this->jump_velocity;
	}

	void on_run(float destance) 
	{
		if (this->is_attacking_ex) return;

		this->m_position.m_x += destance;
	}

	void moveAndCollide(int delta)
	{
		this->m_velocity.m_y += this->gravity * delta;
		this->m_position += this->m_velocity * (float)delta;

		if (this->m_velocity.m_y > 0)
		{
			for (const Platform& pt : platform_list)
			{
				const Platform::CollisionShape& shape = pt.m_shape;

				bool is_collide_x = (max(this->m_position.m_x + this->m_size.m_x, shape.right) - min(this->m_position.m_x, shape.left) <= this->m_size.m_x + (shape.right - shape.left));
				bool is_collide_y = (shape.y >= this->m_position.m_y && shape.y <= this->m_position.m_y + this->m_size.m_y);

				if (is_collide_x && is_collide_y)
				{
					float delta_pos_y = this->m_velocity.m_y * delta;
					float last_tick_foot_pos_y = this->m_position.m_y + this->m_size.m_y - delta_pos_y;
					if (last_tick_foot_pos_y <= shape.y)
					{
						this->m_position.m_y = shape.y - this->m_size.m_y;
						this->m_velocity.m_y = 0;

						break;
					}
				}
			}
		}

		if (!this->is_invulnerable)
		{
			for (Bullet* b : bullet_list)
			{
				if (!b->getValid() || b->getCollideTarget() != this->m_id) continue;

				if (b->checkCollide(this->m_position, this->m_size))
				{
					this->makeInvulnerable();

					b->on_collide();
					b->setValid(false);

					this->m_hp -= b->getDamage();
				}
			}
		}
	}

	void makeInvulnerable()
	{
		this->is_invulnerable = true;
		this->m_timer_invulnerable.restart();
	}

	void setId(PlayerId id) { this->m_id = id; }

	void setPosition(int x, int y) { this->m_position.m_x = x, this->m_position.m_y = y; }

	const Vector2& getPosition() const { return this->m_position; }

	const Vector2& getSize() const { return this->m_size; }

	const int getHp() const { return this->m_hp; }

	const int getMp() const { return this->m_mp; }

	virtual void on_attack() {}

	virtual void on_attack_ex() {}

protected:
	int m_hp = 100;
	int m_mp = 0;

	Vector2 m_size;
	Vector2 m_position;
	Vector2 m_velocity;

	Animation m_animation_idle_left;
	Animation m_animation_idle_right;
	Animation m_animation_run_left;
	Animation m_animation_run_right;
	Animation m_animation_attack_ex_left;
	Animation m_animation_attack_ex_right;

	Animation* m_current_animaiton = nullptr;

	PlayerId m_id;

	IMAGE m_img_sketch;

	const float run_velocity = 0.55f;//水平移动速度
	const float gravity = 0.0016f;//重力加速度
	const float jump_velocity = -0.85f;//跳跃速度

	bool is_invulnerable = false;
	bool is_show_sketch_frame = false;

	bool is_left_keydown = false;
	bool is_right_keydown = false;

	bool is_facing_right = true;

	bool is_attack_keydown = false;
	bool is_attacking_ex = false;

	bool can_attack = true;
	int m_attack_cd = 500;

	Timer m_timer_attack_cd;
	Timer m_timer_invulnerable;
	Timer m_timer_invulnerable_blink;

};

#endif
```

**utils.h**

```
#ifndef _UTILS_H_
#define _UTILS_H_

#pragma comment(lib, "MSIMG32.LIB")

#include <graphics.h>

inline void putImageAlpha(int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void putImageAlpha(const Camera& camera, int dst_x, int dst_y, IMAGE* img)
{
	int w = img->getwidth(), h = img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), (int)(dst_x - camera.getPosition().m_x), (int)(dst_y - camera.getPosition().m_y), w, h, GetImageHDC(img), 0, 0, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void putImageAlpha(int dst_x, int dst_y, int width, int height, IMAGE* img, int src_x, int src_y)
{
	int w = width > 0 ? width : img->getwidth(), h = height > 0 ? height : img->getheight();

	AlphaBlend(GetImageHDC(GetWorkingImage()), dst_x, dst_y, w, h, GetImageHDC(img), src_x, src_y, w, h, { AC_SRC_OVER, 0, 255, AC_SRC_ALPHA });
}

inline void line(const Camera& camera, int x1, int y1, int x2, int y2)
{
	const Vector2& pos_camera = camera.getPosition();
	line((int)(x1 - pos_camera.m_x), (int)(y1 - pos_camera.m_y), (int)(x2 - pos_camera.m_x), (int)(y2 - pos_camera.m_y));
}

inline void flipImage(IMAGE* src, IMAGE* dst)
{
	int w = src->getwidth(), h = src->getheight();
	Resize(dst, w, h);
	
	DWORD* src_buffer = GetImageBuffer(src);
	DWORD* dst_buffer = GetImageBuffer(dst);
	for (int i = 0; i < h; i++)
	{
		for (int j = 0; j < w; j++)
		{
			int src_idx = i * w + j, dst_idx = (i + 1) * w - j - 1;
			dst_buffer[dst_idx] = src_buffer[src_idx];
		}
	}
	return;
}

inline void sketchImage(IMAGE* src, IMAGE* dst)
{
	int w = src->getwidth();
	int h = src->getheight();

	Resize(dst, w, h);
	DWORD* src_buffer = GetImageBuffer(src);
	DWORD* dst_buffer = GetImageBuffer(dst);
	for (int y = 0; y < h; y++)
	{
		for (int x = 0; x < w; x++) 
		{
			int idx = y * w + x;
			dst_buffer[idx] = BGR(RGB(255, 255, 255) | (src_buffer[idx] & 0xFF000000));
		}
	}
}

#endif
```

**bullet.h**

```
#ifndef _BULLET_H_
#define _BULLET_H_

#include "vector2.h"
#include "playerId.h"
#include "camera.h"

#include <functional>
#include <graphics.h>

extern bool is_debug;

class Bullet
{
public:
	Bullet() = default;
	~Bullet() = default;

	virtual void on_collide()
	{
		if (this->m_callback) this->m_callback();
	}

	virtual bool checkCollide(const Vector2& position, const Vector2& size)
	{
		return this->m_position.m_x + this->m_size.m_x / 2 >= position.m_x &&
			this->m_position.m_x + this->m_size.m_x / 2 <= position.m_x + size.m_x && 
			this->m_position.m_y + this->m_size.m_y / 2 >= position.m_y && 
			this->m_position.m_y + this->m_size.m_y / 2 <= position.m_y + size.m_y;
	}

	virtual void on_update(int delta)
	{
	}

	virtual void on_draw(const Camera& camera) const
	{
		if (is_debug)
		{
			setfillcolor((RGB(255, 255, 255)));
			setlinecolor((RGB(255, 255, 255)));

			rectangle((int)this->m_position.m_x, (int)this->m_position.m_y, (int)this->m_position.m_x + this->m_size.m_x, (int)this->m_position.m_y + this->m_size.m_y);
			solidcircle((int)this->m_position.m_x + this->m_size.m_x / 2, (int)this->m_position.m_y + this->m_size.m_y / 2, 5);
		}
	}

	int getDamage() { return this->m_damage; }

	const Vector2& getPosition() { return this->m_position; }

	const Vector2& getSize() { return this->m_size; }

	PlayerId getCollideTarget() const { return this->m_target_id; }

	bool getValid() { return this->is_valid; }

	bool checkCanRemove() const { return this->can_remove; }

	void setCallback(std::function<void()> callback) { this->m_callback = callback; }

	void setDamage(int damage) { this->m_damage = damage; }

	void setPosition(float x, float y) { this->m_position.m_x = x, this->m_position.m_y = y; }

	void setVelocity(float x, float y) { this->m_velocity.m_x = x, this->m_velocity.m_y = y; }

	void setCollideTarget(PlayerId target) { this->m_target_id = target; }

	void setValid(bool is_valid) { this->is_valid = is_valid; }

protected:
	bool checkIfExceedScreen()
	{
		return (this->m_position.m_x + this->m_size.m_x <= 0 || this->m_position.m_x > getwidth() || 
			this->m_position.m_y + this->m_size.m_y <= 0 || this->m_position.m_y > getheight());
	}

protected:
	Vector2 m_size;
	Vector2 m_position;
	Vector2 m_velocity;

	int m_damage = 10;
	
	bool is_valid = true;
	bool can_remove = false;

	std::function<void()> m_callback;

	PlayerId m_target_id = PlayerId::P1;

};

#endif
```

**Gamer1Bullet.h**

```
#ifndef _GAMER1_BULLET_H_
#define _GAMER1_BULLET_H_

#include "bullet.h"
#include "animation.h"

extern IMAGE img_gamer1_bullet;
extern Atlas atlas_gamer1_bullet_break;

class Gamer1Bullet : public Bullet
{
public:
	Gamer1Bullet() 
	{
		this->m_size.m_y = this->m_size.m_x = 64;
		this->m_damage = 10;

		this->m_animation_bullet_break.setAtlas(&atlas_gamer1_bullet_break);
		this->m_animation_bullet_break.setInterval(100);
		this->m_animation_bullet_break.setLoop(false);
		this->m_animation_bullet_break.setCallBack([&]() {this->can_remove = true; });
	}

	~Gamer1Bullet() = default;

	void on_collide()
	{
		Bullet::on_collide();

		switch (rand() % 3)
		{
		case 0:
			mciSendString(L"play gamer1_bullet_break_1 from 0", NULL, 0, NULL);
			break;
		case 1:
			mciSendString(L"play gamer1_bullet_break_2 from 0", NULL, 0, NULL);
			break;
		case 2:
			mciSendString(L"play gamer1_bullet_break_3 from 0", NULL, 0, NULL);
			break;
		default:
			break;
		}
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid)
		{
			putImageAlpha(camera, (int)this->m_position.m_x, (int)this->m_position.m_y, &img_gamer1_bullet);
		}
		else
		{
			this->m_animation_bullet_break.on_draw(camera, (int)this->m_position.m_x, (int)this->m_position.m_y);
		}

		Bullet::on_draw(camera);
	}

	void on_update(int delta)
	{
		this->m_position += this->m_velocity * (float)delta;

		if (!this->is_valid)
		{
			this->m_animation_bullet_break.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	Animation m_animation_bullet_break;

};

#endif
```

**Gamer2Bullet.h**

```
#ifndef _GAMER2_BULLET_H_
#define _GAMER2_BULLET_H_

#include "bullet.h"
#include "animation.h"

extern Camera main_camera;

extern Atlas atlas_gemer2_bullet;
extern Atlas atlas_gemer2_bullet_explode;

class Gamer2Bullet : public Bullet
{
public:
	Gamer2Bullet() 
	{
		this->m_size.m_x = this->m_size.m_y = 96;
		this->m_damage = 20;
		
		this->m_animation_idle.setAtlas(&atlas_gemer2_bullet);
		this->m_animation_idle.setInterval(50);

		this->m_animation_explode.setAtlas(&atlas_gemer2_bullet_explode);
		this->m_animation_explode.setInterval(50);
		this->m_animation_explode.setLoop(false);
		this->m_animation_explode.setCallBack([&]() {this->can_remove = true; });

		IMAGE* frame_idle = this->m_animation_idle.getFrame();
		IMAGE* frame_explode = this->m_animation_explode.getFrame();

		this->m_explode_render_offset.m_x = (frame_idle->getwidth() - frame_explode->getwidth()) / 2.0f;
		this->m_explode_render_offset.m_y = (frame_idle->getheight() - frame_explode->getheight()) / 2.0f;

	}

	~Gamer2Bullet() = default;

	void on_collide()
	{
		Bullet::on_collide();

		main_camera.shake(5, 250);

		mciSendString(L"play gamer2_bullet_explode from 0", NULL, 0, NULL);
	}

	void on_draw(const Camera& camera) const
	{
		if (this->is_valid) 
		{
			this->m_animation_idle.on_draw(camera, this->m_position.m_x, this->m_position.m_y);
		}
		else
		{
			this->m_animation_explode.on_draw(camera, this->m_position.m_x + this->m_explode_render_offset.m_x, this->m_position.m_y + this->m_explode_render_offset.m_y);
		}
		Bullet::on_draw(camera);
	}

	void on_update(int delta)
	{
		if (this->is_valid)
		{
			this->m_velocity.m_y += this->m_gravity * delta;
			this->m_position += this->m_velocity * (float)delta;
		}

		if (!this->is_valid)
		{
			this->m_animation_explode.on_update(delta);
		}
		else
		{
			this->m_animation_idle.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	const float m_gravity = 0.001f;

	Animation m_animation_idle;
	Animation m_animation_explode;
	Vector2 m_explode_render_offset;

};

#endif
```

**Gamer2BulletEx.h**

```
#ifndef _GAMER2_BULLET_EX_H_
#define _GAMER2_BULLET_EX_H_

#include "bullet.h"
#include "animation.h"

extern Camera main_camera;

extern Atlas atlas_gamer2_bullet_ex;
extern Atlas atlas_gamer2_bullet_ex_explode;

class Gamer2BulletEx : public Bullet
{
public:
	Gamer2BulletEx()
	{
		this->m_size.m_x = this->m_size.m_y = 288;
		this->m_damage = 20;

		this->m_animation_idle.setAtlas(&atlas_gamer2_bullet_ex);
		this->m_animation_idle.setInterval(50);

		this->m_animation_explode.setAtlas(&atlas_gamer2_bullet_ex_explode);
		this->m_animation_explode.setInterval(50);
		this->m_animation_explode.setLoop(false);
		this->m_animation_explode.setCallBack([&]() {this->can_remove = true; });

		IMAGE* frame_idle = this->m_animation_idle.getFrame();
		IMAGE* frame_explode = this->m_animation_explode.getFrame();

		this->m_explode_render_offset.m_x = (frame_idle->getwidth() - frame_explode->getwidth()) / 2.0f;
		this->m_explode_render_offset.m_y = (frame_idle->getheight() - frame_explode->getheight()) / 2.0f;

	}

	~Gamer2BulletEx() = default;

	bool checkCollide(const Vector2& position, const Vector2& size)
	{
		bool is_collide_x = (max(this->m_position.m_x + this->m_size.m_x, position.m_x + size.m_x) - min(this->m_position.m_x, position.m_x) <= this->m_size.m_x + size.m_x);
		bool is_collide_y = (max(this->m_position.m_y + this->m_size.m_y, position.m_y + size.m_y) - min(this->m_position.m_y, position.m_y) <= this->m_size.m_y + size.m_y);

		return is_collide_x && is_collide_y;
	}

	void on_collide()
	{
		Bullet::on_collide();

		main_camera.shake(20, 250);

		mciSendString(L"play gamer2_bullet_explode_ex from 0", NULL, 0, NULL);
	}

	void on_draw(const Camera& camera) const
	{ 
		if (this->is_valid)
		{
			this->m_animation_idle.on_draw(camera, this->m_position.m_x, this->m_position.m_y);
		}
		else
		{
			this->m_animation_explode.on_draw(camera, this->m_position.m_x + this->m_explode_render_offset.m_x, this->m_position.m_y + this->m_explode_render_offset.m_y);
		}
		Bullet::on_draw(camera);
	}

	void on_update(int delta)
	{
		if (this->is_valid)
		{
			this->m_position += this->m_velocity * (float)delta;
		}

		if (!this->is_valid)
		{
			this->m_animation_explode.on_update(delta);
		}
		else
		{
			this->m_animation_idle.on_update(delta);
		}

		if (this->checkIfExceedScreen())
		{
			this->can_remove = true;
		}
	}

private:
	Animation m_animation_idle;
	Animation m_animation_explode;
	Vector2 m_explode_render_offset;

};

#endif
```

**statusBar.h**

```
#ifndef _STATUSBAR_H_
#define _STATUSBAR_H_

#include "utils.h"
#include "vector2.h"

class StatusBar 
{
public:
	StatusBar() = default;
	~StatusBar() = default;

	void setAvatar(IMAGE* img)
	{
		this->m_img_avatar = img;
	}

	void setPosition(int x, int y)
	{
		this->m_position.m_x = x, this->m_position.m_y = y;
	}

	void setHp(int val)
	{
		this->m_hp = val;
	}

	void setMp(int val)
	{
		this->m_mp = val;
	}
	
	void on_draw()
	{
		putImageAlpha(this->m_position.m_x, this->m_position.m_y, this->m_img_avatar);

		setfillcolor(RGB(5, 5, 5));
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 10, this->m_position.m_x + 100 + this->width + 3 * 2, this->m_position.m_y + 36, 8, 8);
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 45, this->m_position.m_x + 100 + this->width + 3 * 2, this->m_position.m_y + 71, 8, 8);

		setfillcolor(RGB(67, 47, 47));
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 10, this->m_position.m_x + 100 + this->width + 3, this->m_position.m_y + 33, 8, 8);
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 45, this->m_position.m_x + 100 + this->width + 3, this->m_position.m_y + 68, 8, 8);

		float hp_bar_width = this->width * max(0, this->m_hp) / 100.0f;
		float mp_bar_width = this->width * min(100, this->m_mp) / 100.0f;

		setfillcolor(RGB(197, 61, 67));
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 10, this->m_position.m_x + 100 + (int)hp_bar_width + 3, this->m_position.m_y + 33, 8, 8);
		setfillcolor(RGB(83, 131, 195));
		solidroundrect(this->m_position.m_x + 100, this->m_position.m_y + 45, this->m_position.m_x + 100 + (int)mp_bar_width + 3, this->m_position.m_y + 68, 8, 8);
	}

private:
	const int width = 275;

private:
	int m_hp = 0;
	int m_mp = 0;

	Vector2 m_position = { 0, 0 };

	IMAGE* m_img_avatar = nullptr;

};

#endif
```



## 第十五节

分析与解剖粒子系统时，可以从两个角度入手，即粒子对象本身与粒子发射器。

粒子对象通常由动画物理和生命周期等众多属性来描述，而粒子发射器则决定着粒子对象的生成方式，例如发射频率、发射方向和初始速度等等，也就是说一个完整的粒子系统实现是极为庞大的，目前阶段项目仍然是秉持着深入浅出的核心思想，在目前已有知识技术之上封装一个可用的例子系统。

定义particle.h头文件



## 第十五节完整代码



## 第十六节



## 第十六节完整代码
